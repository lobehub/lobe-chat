import {
  computePromptHash,
  resolveScenario,
  type TracingOptions,
} from '@lobechat/llm-generation-tracing';
import type { ModelRuntimeHooks } from '@lobechat/model-runtime';
import type { ModelUsage } from '@lobechat/types';
import debug from 'debug';

import { after } from '@/server/utils/scheduleAfterResponse';

import { getLLMGenerationTracingService } from './index';

const log = debug('lobe-server:llm-generation-tracing:hook');

const pickString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

/**
 * Validate the loose `options.tracing` bag (the runtime declares it as
 * `Record<string, unknown>`) into the strongly-typed `TracingOptions` shape
 * the hook works with. Unknown keys flow through `metadata` for the DB jsonb
 * column.
 */
const parseTracingOptions = (raw: Record<string, unknown> | undefined): TracingOptions => {
  if (!raw) return {};
  return {
    agentId: pickString(raw.agentId),
    inputHint: pickString(raw.inputHint),
    metadata:
      raw.metadata && typeof raw.metadata === 'object' && !Array.isArray(raw.metadata)
        ? (raw.metadata as Record<string, unknown>)
        : undefined,
    parentTracingId: pickString(raw.parentTracingId),
    promptVersion: pickString(raw.promptVersion),
    scenario: pickString(raw.scenario),
    schemaName: pickString(raw.schemaName),
    systemPrompt: pickString(raw.systemPrompt),
    topicId: pickString(raw.topicId),
    tracingId: pickString(raw.tracingId),
    trigger: pickString(raw.trigger),
  };
};

const extractSystemPrompt = (messages: unknown): string => {
  if (!Array.isArray(messages)) return '';
  const first = messages[0] as { content?: unknown; role?: unknown } | undefined;
  if (first?.role === 'system' && typeof first.content === 'string') return first.content;
  return '';
};

type TracingService = ReturnType<typeof getLLMGenerationTracingService>;

interface CompletedGeneration {
  error?: { code?: string; message?: string; stack?: string };
  latencyMs: number;
  /** Extra jsonb context merged over the caller's `tracing.metadata`. */
  metadata?: Record<string, unknown>;
  model: string;
  options?: { metadata?: Record<string, unknown>; tracing?: Record<string, unknown> };
  payload: { input: unknown; output: unknown; schema: unknown; systemPrompt?: string };
  success: boolean;
  usage?: ModelUsage;
  validationFailed: boolean;
}

interface RecorderContext {
  provider: string;
  service: TracingService;
  userId: string;
  workspaceId?: string;
}

/** Schedule one `llm_generation_tracing` row for a finished generation (object or decision). */
const recordCompletedGeneration = (
  { provider, service, userId, workspaceId }: RecorderContext,
  data: CompletedGeneration,
) => {
  const tracing = parseTracingOptions(data.options?.tracing);
  // `trigger` is also read by ModelRuntime itself (timing logs) so it
  // legitimately lives on `metadata`. Honour the explicit `tracing.trigger`
  // override but fall back to the cross-cutting `origin.trigger`.
  const metadataTrigger = pickString(data.options?.metadata?.trigger);
  const trigger = tracing.trigger ?? metadataTrigger;
  const { scenario, promptVersion } = resolveScenario({
    promptVersion: tracing.promptVersion,
    scenario: tracing.scenario,
    trigger,
  });

  const systemPrompt = tracing.systemPrompt ?? data.payload.systemPrompt ?? '';
  const promptHash = computePromptHash(systemPrompt, data.payload.schema);

  // In-process completion callback (not persisted): lets a caller late-bind
  // a hard FK onto the tracing row, which only exists after this deferred
  // record() commits. Carried on the raw `tracing` bag, so it survives
  // `parseTracingOptions` (which keeps only serializable string fields).
  const rawTracing = (data.options?.tracing ?? {}) as Record<string, unknown>;
  const onPersisted =
    typeof rawTracing.onPersisted === 'function'
      ? (rawTracing.onPersisted as (tracingId: string | null) => void | Promise<void>)
      : undefined;

  const metadata =
    tracing.metadata || data.metadata ? { ...tracing.metadata, ...data.metadata } : undefined;

  after(async () => {
    let persistedTracingId: string | null = null;
    try {
      const result = await service.record({
        agentId: tracing.agentId,
        costUsd: (data.usage as { cost?: number } | undefined)?.cost,
        errorCode: data.error?.code,
        errorDetail: data.error?.message ?? data.error?.stack,
        inputHint: tracing.inputHint,
        inputTokens: data.usage?.totalInputTokens ?? data.usage?.inputTextTokens,
        latencyMs: data.latencyMs,
        // Caller-supplied jsonb context only. `provider` is already a
        // first-class column on the row — no need to duplicate it here.
        metadata,
        model: data.model,
        outputTokens: data.usage?.totalOutputTokens ?? data.usage?.outputTextTokens,
        parentTracingId: tracing.parentTracingId,
        payload: {
          input: data.payload.input,
          output: data.payload.output,
          schema: data.payload.schema,
          systemPrompt,
        },
        promptHash,
        promptVersion,
        provider,
        scenario,
        schemaName: tracing.schemaName,
        success: data.success,
        topicId: tracing.topicId,
        tracingId: tracing.tracingId,
        trigger,
        userId,
        validationFailed: data.validationFailed,
        workspaceId,
      });
      persistedTracingId = result?.tracingId ?? null;
    } catch (err) {
      log('Tracing service threw: %O', err);
    }

    // Signal completion after the row is committed (or null if it wasn't),
    // so the caller's backfill never references a non-existent row.
    if (onPersisted) {
      try {
        await onPersisted(persistedTracingId);
      } catch (err) {
        log('onPersisted callback threw: %O', err);
      }
    }
  });
};

/**
 * Build a `ModelRuntimeHooks` slice that records every `generateObject` and
 * `decide` call to the `llm_generation_tracing` DB table + blob store. Designed
 * to be merged with any business hooks at the ModelRuntime construction site.
 */
export const createLLMGenerationTracingHook = (
  userId: string,
  provider: string,
  workspaceId?: string,
): Pick<ModelRuntimeHooks, 'onDecideComplete' | 'onGenerateObjectComplete'> => {
  const service = getLLMGenerationTracingService();
  if (!service.isEnabled()) return {};

  const recorder: RecorderContext = { provider, service, userId, workspaceId };

  return {
    onDecideComplete: (data, context) => {
      const { questions, state } = context.payload;
      recordCompletedGeneration(recorder, {
        error: data.error,
        latencyMs: data.latencyMs,
        metadata: { decisionMode: data.mode },
        model: context.payload.model,
        options: context.options,
        // The questions play the schema's role: changing them changes the prompt hash.
        payload: { input: state, output: data.response, schema: { questions } },
        success: data.success,
        usage: data.usage,
        validationFailed:
          !data.success && /invalid decision (?:response|request)/i.test(data.error?.message ?? ''),
      });
    },

    onGenerateObjectComplete: (data, context) => {
      // Heuristic: a Zod validation error message starts with the Zod marker.
      const errorMessage = data.error?.message;
      recordCompletedGeneration(recorder, {
        error: data.error,
        latencyMs: data.latencyMs,
        model: context.payload.model,
        options: context.options,
        payload: {
          input: context.payload.messages,
          output: data.output,
          schema: context.payload.schema,
          systemPrompt: extractSystemPrompt(context.payload.messages),
        },
        success: data.success,
        usage: data.usage,
        validationFailed:
          !data.success && typeof errorMessage === 'string' && /zod|validation/i.test(errorMessage),
      });
    },
  };
};
