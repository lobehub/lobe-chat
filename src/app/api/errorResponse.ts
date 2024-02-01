import { AgentRuntimeErrorType, ILobeAgentRuntimeErrorType } from '@/libs/agent-runtime';
import { ErrorResponse } from '@/types/fetch';

const getStatus = (errorType: ILobeAgentRuntimeErrorType) => {
  switch (errorType) {
    case AgentRuntimeErrorType.NoOpenAIAPIKey:
    case AgentRuntimeErrorType.InvalidZhipuAPIKey:
    case AgentRuntimeErrorType.InvalidAccessCode: {
      return 401;
    }

    case AgentRuntimeErrorType.LobeChatBizError: {
      return 576;
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
  }
  return errorType;
};

export const createErrorResponse = (errorType: ILobeAgentRuntimeErrorType, body?: any) => {
  const statusCode = getStatus(errorType);

  const data: ErrorResponse = { body, errorType };

  return new Response(JSON.stringify(data), { status: statusCode });
};
