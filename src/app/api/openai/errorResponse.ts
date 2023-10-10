import { ChatErrorType, ErrorResponse, ErrorType } from '@/types/fetch';

const getStatus = (errorType: ErrorType) => {
  switch (errorType) {
    case ChatErrorType.NoAPIKey:
    case ChatErrorType.InvalidAccessCode: {
      return 401;
    }

    case ChatErrorType.OpenAIBizError: {
      return 577;
    }
  }
  return errorType;
};

export const createErrorResponse = (errorType: ErrorType, body?: any) => {
  const statusCode = getStatus(errorType);

  const data: ErrorResponse = { body, errorType };

  return new Response(JSON.stringify(data), { status: statusCode });
};
