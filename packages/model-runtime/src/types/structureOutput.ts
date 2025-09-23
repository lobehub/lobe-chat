interface GenerateObjectMessage {
  content: string;
  name?: string;
  role: 'user' | 'system' | 'assistant';
}

export interface GenerateObjectPayload {
  messages: GenerateObjectMessage[];
  model: string;
  responseApi?: boolean;
  schema: any;
}

export interface GenerateObjectOptions {
  /**
   * response headers
   */
  headers?: Record<string, any>;

  signal?: AbortSignal;
  /**
   * userId for the GenerateObject
   */
  user?: string;
}
