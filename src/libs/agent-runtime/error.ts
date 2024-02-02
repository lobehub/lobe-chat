/* eslint-disable sort-keys-fix/sort-keys-fix */

// ******* Runtime Biz Error ******* //
export const AgentRuntimeErrorType = {
  LocationNotSupportError: 'LocationNotSupportError',
  AgentRuntimeError: 'AgentRuntimeError', // Agent Runtime 模块运行时错误

  BedrockBizError: 'BedrockBizError', // Bedrock 返回的业务错误

  OpenAIBizError: 'OpenAIBizError', // OpenAI 返回的业务错误
  NoOpenAIAPIKey: 'NoOpenAIAPIKey',

  InvalidZhipuAPIKey: 'InvalidZhipuAPIKey',
  ZhipuBizError: 'ZhipuBizError',

  InvalidGoogleAPIKey: 'InvalidGoogleAPIKey',
  GoogleBizError: 'GoogleBizError',
} as const;

export type ILobeAgentRuntimeErrorType =
  (typeof AgentRuntimeErrorType)[keyof typeof AgentRuntimeErrorType];
