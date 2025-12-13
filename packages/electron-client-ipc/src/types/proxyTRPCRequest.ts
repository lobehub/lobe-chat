export interface StreamInvokeRequestParams {
  body?: string | ArrayBuffer;
  headers: Record<string, string>;
  method: string;
  urlPath: string;
}

export interface ProxyTRPCStreamRequestParams extends StreamInvokeRequestParams {
  requestId: string;
}
