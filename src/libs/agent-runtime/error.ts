/* eslint-disable sort-keys-fix/sort-keys-fix */
// ******* Runtime Biz Error ******* //
export const AgentRuntimeErrorType = {
  AgentRuntimeError: 'AgentRuntimeError', // Agent Runtime 模块运行时错误
  LocationNotSupportError: 'LocationNotSupportError',

  OpenAIBizError: 'OpenAIBizError',

  NoOpenAIAPIKey: 'NoOpenAIAPIKey',

  InvalidAzureAPIKey: 'InvalidAzureAPIKey',
  AzureBizError: 'AzureBizError',

  InvalidZhipuAPIKey: 'InvalidZhipuAPIKey',
  ZhipuBizError: 'ZhipuBizError',

  InvalidGoogleAPIKey: 'InvalidGoogleAPIKey',
  GoogleBizError: 'GoogleBizError',

  InvalidBedrockCredentials: 'InvalidBedrockCredentials',
  BedrockBizError: 'BedrockBizError',

  InvalidMistralAPIKey: 'InvalidMistralAPIKey',
  MistralBizError: 'MistralBizError',

  InvalidMoonshotAPIKey: 'InvalidMoonshotAPIKey',
  MoonshotBizError: 'MoonshotBizError',

  InvalidOllamaArgs: 'InvalidOllamaArgs',
  OllamaBizError: 'OllamaBizError',

  InvalidPerplexityAPIKey: 'InvalidPerplexityAPIKey',
  PerplexityBizError: 'PerplexityBizError',

  InvalidAnthropicAPIKey: 'InvalidAnthropicAPIKey',
  AnthropicBizError: 'AnthropicBizError',

  InvalidGroqAPIKey: 'InvalidGroqAPIKey',
  GroqBizError: 'GroqBizError',
  
  InvalidOpenRouterAPIKey: 'InvalidOpenRouterAPIKey',
  OpenRouterBizError: 'OpenRouterBizError',
} as const;

export type ILobeAgentRuntimeErrorType =
  (typeof AgentRuntimeErrorType)[keyof typeof AgentRuntimeErrorType];
