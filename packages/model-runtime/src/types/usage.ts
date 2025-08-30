export interface ModelTokensUsage {
  acceptedPredictionTokens?: number;
  inputAudioTokens?: number;
  inputCacheMissTokens?: number;
  inputCachedTokens?: number;
  /**
   * currently only pplx has citation_tokens
   */
  inputCitationTokens?: number;
  /**
   * user prompt image
   */
  inputImageTokens?: number;
  /**
   * user prompt input
   */
  inputTextTokens?: number;
  inputWriteCacheTokens?: number;
  outputAudioTokens?: number;
  outputImageTokens?: number;
  outputReasoningTokens?: number;
  outputTextTokens?: number;
  rejectedPredictionTokens?: number;
  totalInputTokens?: number;
  totalOutputTokens?: number;
  totalTokens?: number;
}
