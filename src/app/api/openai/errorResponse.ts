import { ChatErrorType, ErrorResponse, ErrorType } from '@/types/fetch';

export const getErrorStatus = (errorType: ErrorType) => {
  switch (errorType) {
    case ChatErrorType.NoAPIKey:
    case ChatErrorType.InvalidAccessCode: {
      return 401;
    }

    case ChatErrorType.InsufficientQuotaError: {
      return 429;
    }

    case ChatErrorType.OpenAIBizError: {
      return 577;
    }

    case ChatErrorType.FetchError: {
      return 504;
    }
  }
  return errorType;
};

export const getErrorResponse = (errorType: ErrorType, body?: any) => {
  const statusCode = getErrorStatus(errorType);

  return { body, errorType, status: statusCode };
};

export const createErrorResponse = (errorType: ErrorType, body?: any) => {
  const statusCode = getErrorStatus(errorType);

  const data: ErrorResponse = { body, errorType };

  return new Response(JSON.stringify(data), { status: statusCode });
};
