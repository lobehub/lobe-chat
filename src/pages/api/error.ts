import { ErrorResponse, ErrorType } from '@/types/fetch';

const getStatus = (errorType: ErrorType) => {
  switch (errorType) {
    case ErrorType.InvalidAccessCode: {
      return 401;
    }
  }
};

export const createErrorResponse = (errorType: ErrorType) => {
  const statusCode = getStatus(errorType);

  const data: ErrorResponse = { errorType };

  return new Response(JSON.stringify(data), { status: statusCode });
};
