export interface TextToSpeechPayload {
  input: string;
  model: string;
  voice: string;
}

export interface TextToSpeechOptions {
  headers?: Record<string, any>;
  signal?: AbortSignal;
  /**
   * userId for the embeddings
   */
  user?: string;
}
