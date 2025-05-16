import { RequestLog } from "@/types/usage";

/* eslint-disable typescript-sort-keys/interface */
export interface IUsageService {
  createRequestLog(requestLog: RequestLog): Promise<void>;
}
