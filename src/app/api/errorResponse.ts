import { AgentRuntimeErrorType, ILobeAgentRuntimeErrorType } from '@/libs/agent-runtime';
import { ChatErrorType, ErrorResponse, IChatErrorType } from '@/types/fetch';

const getStatus = (errorType: ILobeAgentRuntimeErrorType | IChatErrorType) => {
  switch (errorType) {
    case ChatErrorType.InvalidAccessCode:
    case AgentRuntimeErrorType.NoOpenAIAPIKey:
    case AgentRuntimeErrorType.InvalidAzureOpenAIAPIKey:
    case AgentRuntimeErrorType.InvalidBedrockCredentials:
    case AgentRuntimeErrorType.InvalidZhipuAPIKey:
    case AgentRuntimeErrorType.InvalidGoogleAPIKey: {
      return 401;
    }

    case AgentRuntimeErrorType.LocationNotSupportError: {
      return 403;
    }

    case AgentRuntimeErrorType.AgentRuntimeError: {
      return 470;
    }
    case AgentRuntimeErrorType.OpenAIBizError: {
      return 471;
    }
    case AgentRuntimeErrorType.ZhipuBizError: {
      return 472;
    }
    case AgentRuntimeErrorType.BedrockBizError: {
      return 473;
    }
    case AgentRuntimeErrorType.GoogleBizError: {
      return 474;
    }
  }
  return errorType;
};

export const createErrorResponse = (
  errorType: IChatErrorType | ILobeAgentRuntimeErrorType,
  body?: any,
) => {
  const statusCode = getStatus(errorType);

  const data: ErrorResponse = { body, errorType };

  return new Response(JSON.stringify(data), { status: statusCode });
};
