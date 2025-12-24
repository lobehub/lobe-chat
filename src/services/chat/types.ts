import { FetchSSEOptions } from '@lobechat/fetch-sse';
import { RuntimeInitialContext, RuntimeStepContext, TracePayload } from '@lobechat/types';

export interface FetchOptions extends FetchSSEOptions {
  historySummary?: string;
  /** Initial context for page editor (captured at operation start) */
  initialContext?: RuntimeInitialContext;
  signal?: AbortSignal | undefined;
  /** Step context for page editor (updated each step) */
  stepContext?: RuntimeStepContext;
  trace?: TracePayload;
}
