export declare const ChatErrorType: {
    readonly InvalidAccessCode: "InvalidAccessCode";
    readonly OpenAIBizError: "OpenAIBizError";
    readonly NoAPIKey: "NoAPIKey";
    readonly BadRequest: 400;
    readonly Unauthorized: 401;
    readonly Forbidden: 403;
    readonly ContentNotFound: 404;
    readonly MethodNotAllowed: 405;
    readonly TooManyRequests: 429;
    readonly InternalServerError: 500;
    readonly BadGateway: 502;
    readonly ServiceUnavailable: 503;
    readonly GatewayTimeout: 504;
};
export type ErrorType = (typeof ChatErrorType)[keyof typeof ChatErrorType];
export interface ErrorResponse {
    body: any;
    errorType: ErrorType;
}
