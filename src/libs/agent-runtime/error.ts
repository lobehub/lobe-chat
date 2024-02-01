/* eslint-disable sort-keys-fix/sort-keys-fix */

export const AgentRuntimeErrorType = {
  // ******* 业务错误语义 ******* //

  InvalidAccessCode: 'InvalidAccessCode', // 密码无效

  BedrockBizError: 'BedrockBizError', // Bedrock 返回的业务错误

  OpenAIBizError: 'OpenAIBizError', // OpenAI 返回的业务错误

  NoOpenAIAPIKey: 'NoOpenAIAPIKey',

  InvalidZhipuAPIKey: 'InvalidZhipuAPIKey',
  ZhipuBizError: 'ZhipuBizError',

  AgentRuntimeError: 'AgentRuntimeError', // Agent Runtime 模块运行时错误
  LobeChatBizError: 'LobeChatBizError', // LobeChat 层的业务代码错误

  // ******* 客户端错误 ******* //
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  ContentNotFound: 404, // 没找到接口
  MethodNotAllowed: 405, // 不支持
  TooManyRequests: 429,

  // ******* 服务端错误 ******* //
  InternalServerError: 500,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
} as const;

export type ILobeAgentRuntimeErrorType =
  (typeof AgentRuntimeErrorType)[keyof typeof AgentRuntimeErrorType];
