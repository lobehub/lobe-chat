import { consola } from 'consola';

import { AgentRuntimeErrorType, ILobeAgentRuntimeErrorType } from '@/libs/agent-runtime';
import { ChatErrorType, ErrorResponse, ErrorType } from '@/types/fetch';

const getStatus = (errorType: ILobeAgentRuntimeErrorType | ErrorType) => {
  switch (errorType) {
    case ChatErrorType.InvalidAccessCode:
    case AgentRuntimeErrorType.NoOpenAIAPIKey:
    case AgentRuntimeErrorType.InvalidAzureAPIKey:
    case AgentRuntimeErrorType.InvalidBedrockCredentials:
    case AgentRuntimeErrorType.InvalidZhipuAPIKey:
    case AgentRuntimeErrorType.InvalidGoogleAPIKey: {
      return 401;
    }

    case AgentRuntimeErrorType.LocationNotSupportError: {
      return 403;
    }

    // define the 471~480 as provider error
    case AgentRuntimeErrorType.AgentRuntimeError: {
      return 470;
    }
    case AgentRuntimeErrorType.OpenAIBizError: {
      return 471;
    }
    case AgentRuntimeErrorType.AzureBizError: {
      return 472;
    }
    case AgentRuntimeErrorType.ZhipuBizError: {
      return 473;
    }
    case AgentRuntimeErrorType.BedrockBizError: {
      return 474;
    }
    case AgentRuntimeErrorType.GoogleBizError: {
      return 475;
    }
  }
  return errorType;
};

export const createErrorResponse = (
  errorType: ErrorType | ILobeAgentRuntimeErrorType,
  body?: any,
) => {
  const statusCode = getStatus(errorType);

  const data: ErrorResponse = { body, errorType };

  if (typeof statusCode !== 'number' || statusCode < 200 || statusCode > 599) {
    consola.error(
      `current StatusCode: \`${statusCode}\` .`,
      'Please go to `./src/app/api/errorResponse.ts` to defined the statusCode.',
    );
  }

  return new Response(JSON.stringify(data), { status: statusCode });
};
