import { TracePayload } from '@lobechat/types';

import { FetchSSEOptions } from '@/utils/fetch';

export interface FetchOptions extends FetchSSEOptions {
  historySummary?: string;
  signal?: AbortSignal | undefined;
  trace?: TracePayload;
}
