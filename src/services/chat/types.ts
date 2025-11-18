import { FetchSSEOptions } from '@lobechat/fetch-sse';
import { TracePayload } from '@lobechat/types';

export interface FetchOptions extends FetchSSEOptions {
  historySummary?: string;
  signal?: AbortSignal | undefined;
  trace?: TracePayload;
}
