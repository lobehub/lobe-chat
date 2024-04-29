import { IPluginErrorType, PluginErrorType } from '@lobehub/chat-plugin-sdk';
import type { AlertProps } from '@lobehub/ui';
import { memo } from 'react';

import { AgentRuntimeErrorType, ILobeAgentRuntimeErrorType } from '@/libs/agent-runtime';
import { ChatErrorType, ErrorType } from '@/types/fetch';
import { ChatMessage, ChatMessageError } from '@/types/message';

import ErrorJsonViewer from './ErrorJsonViewer';
import InvalidAPIKey from './InvalidAPIKey';
import InvalidAccessCode from './InvalidAccessCode';
import OllamaBizError from './OllamaBizError';
import OpenAiBizError from './OpenAiBizError';
import PluginSettings from './PluginSettings';

// Config for the errorMessage display
export const getErrorAlertConfig = (
  errorType?: IPluginErrorType | ILobeAgentRuntimeErrorType | ErrorType,
): AlertProps | undefined => {
  // OpenAIBizError / ZhipuBizError / GoogleBizError / ...
  if (typeof errorType === 'string' && (errorType.includes('Biz') || errorType.includes('Invalid')))
    return {
      extraDefaultExpand: true,
      extraIsolate: true,
      type: 'warning',
    };

  switch (errorType) {
    case AgentRuntimeErrorType.LocationNotSupportError: {
      return {
        type: 'warning',
      };
    }

    case AgentRuntimeErrorType.NoOpenAIAPIKey: {
      return {
        extraDefaultExpand: true,
        extraIsolate: true,
        type: 'warning',
      };
    }

    default: {
      return undefined;
    }
  }
};

const ErrorMessageExtra = memo<{ data: ChatMessage }>(({ data }) => {
  const error = data.error as ChatMessageError;
  if (!error?.type) return;

  switch (error.type) {
    case PluginErrorType.PluginSettingsInvalid: {
      return <PluginSettings id={data.id} plugin={data.plugin} />;
    }

    case AgentRuntimeErrorType.OpenAIBizError: {
      return <OpenAiBizError {...data} />;
    }

    case AgentRuntimeErrorType.OllamaBizError: {
      return <OllamaBizError {...data} />;
    }

    case ChatErrorType.InvalidAccessCode: {
      return <InvalidAccessCode id={data.id} provider={data.error?.body?.provider} />;
    }

    case AgentRuntimeErrorType.InvalidBedrockCredentials:
    case AgentRuntimeErrorType.InvalidZhipuAPIKey:
    case AgentRuntimeErrorType.InvalidMinimaxAPIKey:
    case AgentRuntimeErrorType.InvalidMistralAPIKey:
    case AgentRuntimeErrorType.InvalidMoonshotAPIKey:
    case AgentRuntimeErrorType.InvalidGoogleAPIKey:
    case AgentRuntimeErrorType.InvalidPerplexityAPIKey:
    case AgentRuntimeErrorType.InvalidAnthropicAPIKey:
    case AgentRuntimeErrorType.InvalidGroqAPIKey:
    case AgentRuntimeErrorType.InvalidOpenRouterAPIKey:
    case AgentRuntimeErrorType.InvalidTogetherAIAPIKey:
    case AgentRuntimeErrorType.InvalidZeroOneAPIKey:
    case AgentRuntimeErrorType.NoOpenAIAPIKey: {
      return <InvalidAPIKey id={data.id} provider={data.error?.body?.provider} />;
    }

    default: {
      return <ErrorJsonViewer error={data.error} id={data.id} />;
    }
  }
});

export default ErrorMessageExtra;
