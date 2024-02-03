/* eslint-disable sort-keys-fix/sort-keys-fix */

// ******* Runtime Biz Error ******* //
export const AgentRuntimeErrorType = {
  AgentRuntimeError: 'AgentRuntimeError', // Agent Runtime 模块运行时错误
  LocationNotSupportError: 'LocationNotSupportError',

  OpenAIBizError: 'OpenAIBizError', // OpenAI 返回的业务错误
  NoOpenAIAPIKey: 'NoOpenAIAPIKey',

  InvalidAzureOpenAIAPIKey: 'InvalidAzureOpenAIAPIKey',

  InvalidZhipuAPIKey: 'InvalidZhipuAPIKey',
  ZhipuBizError: 'ZhipuBizError',

  InvalidGoogleAPIKey: 'InvalidGoogleAPIKey',
  GoogleBizError: 'GoogleBizError',

  InvalidBedrockCredentials: 'InvalidBedrockCredentials',
  BedrockBizError: 'BedrockBizError', // Bedrock 返回的业务错误
} as const;

export type ILobeAgentRuntimeErrorType =
  (typeof AgentRuntimeErrorType)[keyof typeof AgentRuntimeErrorType];
