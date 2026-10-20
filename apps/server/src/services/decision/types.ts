import type { TracingScenario } from '@lobechat/const';
import type { TracingOptions } from '@lobechat/llm-generation-tracing';
import type {
  DecisionQuestions,
  DecisionRequest,
  DecisionResponse,
  RequestTrigger,
} from '@lobechat/types';

export interface DecisionContext {
  /** Extra billing / routing context forwarded to model hooks. */
  metadata?: Record<string, unknown>;
  /** Tracing workflow partition. Each product workflow and lifecycle stage owns its own value. */
  scenario: TracingScenario;
  signal?: AbortSignal;
  /** Entity ids and other tracing fields. `scenario`, `promptVersion` and `schemaName` are set by the backend. */
  tracing?: Omit<TracingOptions, 'promptVersion' | 'scenario' | 'schemaName' | 'trigger'>;
  /** Feature the model usage is billed to. */
  trigger: RequestTrigger;
}

export interface DecisionBackend {
  decide: <Q extends DecisionQuestions>(
    request: DecisionRequest<Q>,
    ctx: DecisionContext,
  ) => Promise<DecisionResponse<Q>>;
}

export type DecisionErrorReason = 'backend_error' | 'invalid_output' | 'invalid_request';

export class DecisionError extends Error {
  readonly reason: DecisionErrorReason;

  constructor(reason: DecisionErrorReason, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'DecisionError';
    this.reason = reason;
  }
}
