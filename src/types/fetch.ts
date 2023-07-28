export enum ErrorType {
  // ******* 业务错误语义 ******* //

  // 密码无效
  InvalidAccessCode = 'InvalidAccessCode',
  // OpenAI 返回的业务错误
  OpenAIBizError = 'OpenAIBizError',

  // ******* 客户端错误 ******* //
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  ContentNotFound = 404, // 没找到接口
  TooManyRequests = 429,

  // ******* 服务端错误 ******* //
  InternalServerError = 500,
  BadGateway = 502,
  ServiceUnavailable = 503,
  GatewayTimeout = 504,
}

export interface ErrorResponse {
  body: any;
  errorType: ErrorType;
}
