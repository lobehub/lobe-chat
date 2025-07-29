export type ProxyTRPCRequestParams = {
  /** Request body (can be string, ArrayBuffer, or null/undefined) */
  body?: string | ArrayBuffer;
  /** Request headers */
  headers: Record<string, string>;
  /** The HTTP method (e.g., 'GET', 'POST') */
  method: string;
  /** The path and query string of the request (e.g., '/trpc/lambda/...') */
  urlPath: string;
};

export interface ProxyTRPCStreamRequestParams extends Omit<ProxyTRPCRequestParams, 'body'> {
  body?: ArrayBuffer;
  requestId: string;
}

export interface ProxyTRPCRequestResult {
  /** Response body (likely as ArrayBuffer or string) */
  body: ArrayBuffer | string;
  /** Response headers */
  headers: Record<string, string>;
  /** Response status code */
  status: number;
  /** Response status text */
  statusText: string;
}
