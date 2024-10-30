export interface EmbeddingsPayload {
  /**
   * The number of dimensions the resulting output embeddings should have. Only
   * supported in `text-embedding-3` and later models.
   */
  dimensions?: number;
  /**
   * Input text to embed, encoded as a string or array of tokens. To embed multiple
   * inputs in a single request, pass an array of strings .
   * The input must not exceed the max input tokens for the model (8192 tokens for
   * `text-embedding-ada-002`), cannot be an empty string, and any array must be 2048
   * dimensions or less.
   */
  input: string | Array<string>;

  model: string;
}

export interface EmbeddingsOptions {
  headers?: Record<string, any>;
  signal?: AbortSignal;
  /**
   * userId for the embeddings
   */
  user?: string;
}

export type Embeddings = Array<number>;
