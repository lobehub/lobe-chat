import { randomUUID } from 'node:crypto';

import type { TracingOptions } from '@lobechat/llm-generation-tracing';
import type { ChatCompletionTool } from '@lobechat/model-runtime';
import {
  buildDecisionJsonSchema,
  chainDecision,
  DECISION_FUNCTION_NAME,
  DECISION_PROMPT_VERSION,
} from '@lobechat/prompts';
import type {
  DecisionQuestions,
  DecisionRequest,
  DecisionResponse,
  ModelUsage,
} from '@lobechat/types';
import { AgentRuntimeErrorType } from '@lobechat/types';
import { isRecord } from '@lobechat/utils/object';
import debug from 'debug';

import type { AiGenerationService } from '@/server/services/aiGeneration';

import {
  assertDecisionRequest,
  buildRawDecisionSchema,
  normalizeDecisionAnswers,
} from './normalize';
import type { DecisionBackend, DecisionContext } from './types';
import { DecisionError } from './types';

const log = debug('lobe-server:decision:tool-choice');

type GenerationMode = 'json_schema' | 'tool_choice';

export interface DecisionModelConfig {
  model: string;
  provider: string;
}

export interface ToolChoiceDecisionBackendOptions {
  generator: Pick<AiGenerationService, 'generateObject'>;
  /** Resolves the model on every call so settings changes apply without a restart. */
  resolveModel: () => Promise<DecisionModelConfig>;
}

const parseJsonText = (text: string): unknown => {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // Plain-text fallback: models without structured output may wrap the JSON in prose or fences.
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start === -1 || end <= start) return undefined;
    try {
      return JSON.parse(trimmed.slice(start, end + 1));
    } catch {
      return undefined;
    }
  }
};

/**
 * Pulls the `submit_decisions` arguments out of whatever `generateObject`
 * returned: a tool-call list, a structured object, or raw JSON text.
 */
export const extractDecisionArguments = (result: unknown): unknown => {
  if (Array.isArray(result)) {
    const calls = result.filter(isRecord);
    const call = calls.find((item) => item.name === DECISION_FUNCTION_NAME) ?? calls[0];
    if (!call) return undefined;
    return typeof call.arguments === 'string' ? parseJsonText(call.arguments) : call.arguments;
  }
  if (typeof result === 'string') return parseJsonText(result);
  return result;
};

const isAbortError = (error: unknown, signal?: AbortSignal) =>
  signal?.aborted || (error instanceof Error && error.name === 'AbortError');

/** Runtime error types that mean "this model or route cannot do a forced tool call". */
const TOOL_CAPABILITY_ERROR_TYPES = new Set<string>([
  AgentRuntimeErrorType.CapabilityNotSupported,
  AgentRuntimeErrorType.InvalidRequestFormat,
  AgentRuntimeErrorType.UpstreamMalformedResponse,
]);

/** Catch-all provider buckets whose message must name tools to count as a capability error. */
const GENERIC_PROVIDER_ERROR_TYPES = new Set<string>([
  AgentRuntimeErrorType.ProviderBizError,
  AgentRuntimeErrorType.UpstreamHttpError,
]);

const TOOL_CAPABILITY_MESSAGE = /tool|function[\s_-]?call/i;

const describeError = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (!isRecord(error)) return String(error);
  try {
    return JSON.stringify(error.error ?? error.message ?? error);
  } catch {
    return '';
  }
};

/**
 * Whether a failed forced-tool-call request failed because the model or route does not support
 * tool calling, so JSON-schema mode may still succeed.
 *
 * Auth, quota, budget, rate-limit, network, and other provider failures are not capability
 * errors: retrying them in another mode would only repeat the failure (and its cost), so they
 * propagate.
 */
export const isToolCapabilityError = (error: unknown): boolean => {
  const errorType = isRecord(error) && typeof error.errorType === 'string' ? error.errorType : '';
  if (errorType) {
    if (TOOL_CAPABILITY_ERROR_TYPES.has(errorType)) return true;
    if (GENERIC_PROVIDER_ERROR_TYPES.has(errorType)) {
      return TOOL_CAPABILITY_MESSAGE.test(describeError(error));
    }
    return false;
  }
  return TOOL_CAPABILITY_MESSAGE.test(describeError(error));
};

/**
 * Answers decision questions with one forced function call (`submit_decisions`)
 * on a regular chat model, then converts the discrete 0-4 levels into
 * OpenRouter-shaped answers.
 *
 * When the model does not return the forced call, or the request fails because
 * the model or route cannot call tools, it retries once in JSON-schema mode,
 * which itself accepts plain JSON text. Any other failure (auth, quota, budget,
 * rate limit, network) propagates without a retry. Output that fails validation is retried once in the same mode.
 */
export class ToolChoiceDecisionBackend implements DecisionBackend {
  private readonly generator: ToolChoiceDecisionBackendOptions['generator'];
  private readonly resolveModel: ToolChoiceDecisionBackendOptions['resolveModel'];

  constructor({ generator, resolveModel }: ToolChoiceDecisionBackendOptions) {
    this.generator = generator;
    this.resolveModel = resolveModel;
  }

  decide = async <Q extends DecisionQuestions>(
    request: DecisionRequest<Q>,
    ctx: DecisionContext,
  ): Promise<DecisionResponse<Q>> => {
    assertDecisionRequest(request);

    const { model, provider } = await this.resolveModel();
    const { messages } = chainDecision({ questions: request.questions, state: request.state });
    const jsonSchema = buildDecisionJsonSchema(request.questions);
    const rawSchema = buildRawDecisionSchema(request.questions);
    const tool: ChatCompletionTool = {
      function: {
        description: jsonSchema.description,
        name: jsonSchema.name,
        parameters: jsonSchema.schema,
      },
      type: 'function',
    };

    const usage = { cost: 0, hasCost: false, input: 0, output: 0 };
    const onUsage = (value: ModelUsage) => {
      usage.input += value.totalInputTokens ?? 0;
      usage.output += value.totalOutputTokens ?? 0;
      if (typeof value.cost === 'number') {
        usage.cost += value.cost;
        usage.hasCost = true;
      }
    };

    const generate = async (mode: GenerationMode) => {
      const result = await this.generator.generateObject(
        {
          messages,
          model,
          provider,
          ...(mode === 'tool_choice' ? { tools: [tool] } : { schema: jsonSchema }),
        },
        {
          metadata: { ...ctx.metadata, trigger: ctx.trigger },
          onUsage,
          signal: ctx.signal,
          tracing: {
            ...ctx.tracing,
            metadata: { ...ctx.tracing?.metadata, decisionMode: mode },
            promptVersion: DECISION_PROMPT_VERSION,
            scenario: ctx.scenario,
            schemaName: jsonSchema.name,
          } satisfies TracingOptions,
        },
      );
      return extractDecisionArguments(result);
    };

    let mode: GenerationMode = 'tool_choice';
    let output: unknown;
    try {
      output = await generate(mode);
    } catch (error) {
      if (isAbortError(error, ctx.signal) || !isToolCapabilityError(error)) throw error;
      log('forced tool call unsupported, falling back to JSON schema: %O', error);
    }
    if (output === undefined) {
      mode = 'json_schema';
      output = await generate(mode);
    }

    let parsed = rawSchema.safeParse(output);
    if (!parsed.success) {
      log('%s output failed validation, retrying once: %O', mode, parsed.error.issues);
      parsed = rawSchema.safeParse(await generate(mode));
    }
    if (!parsed.success) {
      throw new DecisionError('invalid_output', `Decision output failed validation (${mode})`, {
        cause: parsed.error,
      });
    }

    return {
      answers: normalizeDecisionAnswers(request.questions, parsed.data),
      backend: 'tool_choice',
      id: `dec-${randomUUID()}`,
      model,
      provider,
      usage: {
        ...(usage.hasCost ? { cost: usage.cost } : {}),
        input_tokens: usage.input,
        output_tokens: usage.output,
      },
    };
  };
}
