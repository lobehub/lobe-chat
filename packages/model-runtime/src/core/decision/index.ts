import type { ModelUsage } from '@lobechat/types';
import { AgentRuntimeErrorType } from '@lobechat/types';
import createDebug from 'debug';

import type {
  DecisionMode,
  DecisionOptions,
  DecisionPayload,
  DecisionQuestions,
  DecisionResponse,
} from '../../types';
import { AgentRuntimeError } from '../../utils/createError';
import { getModelType } from '../../utils/getModelPricing';
import type { LobeRuntimeAI } from '../BaseAI';
import type { DecisionGenerateObject } from './emulate';
import { emulateDecision } from './emulate';
import { validateDecisionPayload, validateDecisionResponse } from './validate';

export type { DecisionGenerateObject, EmulateDecisionParams } from './emulate';
export { emulateDecision } from './emulate';
export {
  SUPPORTED_DECISION_QUESTION_TYPES,
  validateDecisionPayload,
  validateDecisionResponse,
} from './validate';

/** The runtime surface a decision needs: native `decide`, or `generateObject` to emulate it. */
export interface DecisionRuntime {
  decide?: LobeRuntimeAI['decide'];
  generateObject?: DecisionGenerateObject;
}

export interface PlanDecisionParams {
  /** See `EmulateDecisionParams.invalidOutputRetries`. */
  invalidOutputRetries?: number;
  provider: string;
}

export interface DecisionPlan<Q extends DecisionQuestions = DecisionQuestions> {
  mode: DecisionMode;
  /**
   * Performs the call, validates the response and stamps `usage` and
   * `providerMetadata.lobehub.decisionMode` on it. `options.onUsage` still fires.
   */
  run: (options?: DecisionOptions) => Promise<DecisionResponse<Q>>;
}

const log = createDebug('lobe-model-runtime:decide');

const unsupported = (provider: string, message: string) =>
  AgentRuntimeError.chat({
    error: new Error(message),
    errorType: AgentRuntimeErrorType.CapabilityNotSupported,
    provider,
  });

const resolveMode = async (
  runtime: DecisionRuntime,
  payload: DecisionPayload,
  options: DecisionOptions | undefined,
  provider: string,
): Promise<DecisionMode> => {
  const requested = options?.mode ?? 'auto';

  if (requested === 'native') {
    if (!runtime.decide) {
      throw unsupported(provider, 'Decision models are not supported by this provider');
    }
    return 'native';
  }

  if (requested === 'auto') {
    // A model-bank lookup failure only loses the routing hint: treat the model as unlisted.
    const modelType = await getModelType(payload.model, provider, options?.pricingContext).catch(
      (error) => {
        log('model-bank lookup failed for %s: %O', payload.model, error);
        return undefined;
      },
    );
    const isDecisionModel = modelType === 'decision';
    if (isDecisionModel) {
      // A decision model cannot generate text, so there is nothing to emulate with.
      if (!runtime.decide) {
        throw unsupported(provider, 'Decision models are not supported by this provider');
      }
      return 'native';
    }
  }

  if (!runtime.generateObject) {
    throw unsupported(
      provider,
      'This provider supports neither decision models nor structured output, so it cannot decide',
    );
  }
  return 'emulated';
};

/**
 * Validates the request and picks how to serve it, before any I/O to the provider:
 * - native when the provider implements `decide` and the model is a decision model
 *   (model-bank `type: 'decision'`, or `options.mode === 'native'`);
 * - otherwise emulated through the runtime's own `generateObject` (see `emulateDecision`).
 *
 * Throws `InvalidRequestFormat` for a malformed request and `CapabilityNotSupported` when the
 * runtime can serve neither path, so callers can fail before running billing hooks.
 */
export const planDecision = async <Q extends DecisionQuestions>(
  runtime: DecisionRuntime,
  payload: DecisionPayload<Q>,
  options: DecisionOptions | undefined,
  { invalidOutputRetries, provider }: PlanDecisionParams,
): Promise<DecisionPlan<Q>> => {
  validateDecisionPayload(payload, provider);
  const mode = await resolveMode(runtime, payload, options, provider);

  const run = async (runOptions?: DecisionOptions): Promise<DecisionResponse<Q>> => {
    let usage: ModelUsage | undefined;
    const callOptions: DecisionOptions = {
      ...runOptions,
      onUsage: async (reported) => {
        usage = reported;
        await runOptions?.onUsage?.(reported);
      },
    };

    const response =
      mode === 'native'
        ? await runtime.decide!(payload, callOptions)
        : await emulateDecision(payload, callOptions, {
            generateObject: (objectPayload, objectOptions) =>
              runtime.generateObject!(objectPayload, objectOptions),
            invalidOutputRetries,
            provider,
          });

    validateDecisionResponse(payload, response, provider);

    const lobehubMetadata = response.providerMetadata?.lobehub;
    return {
      ...response,
      providerMetadata: {
        ...response.providerMetadata,
        lobehub: { ...lobehubMetadata, decisionMode: mode },
      },
      ...((response.usage ?? usage) && { usage: response.usage ?? usage }),
    } as DecisionResponse<Q>;
  };

  return { mode, run };
};

/** {@link planDecision} and run it in one step, for callers without hooks between the two. */
export const runDecision = async <Q extends DecisionQuestions>(
  runtime: DecisionRuntime,
  payload: DecisionPayload<Q>,
  options: DecisionOptions | undefined,
  params: PlanDecisionParams,
): Promise<DecisionResponse<Q>> =>
  (await planDecision(runtime, payload, options, params)).run(options);
