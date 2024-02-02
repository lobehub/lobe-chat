import { IPluginErrorType, PluginErrorType } from '@lobehub/chat-plugin-sdk';
import type { AlertProps } from '@lobehub/ui';
import { memo } from 'react';

import { AgentRuntimeErrorType, ILobeAgentRuntimeErrorType } from '@/libs/agent-runtime';
import { ChatErrorType, IChatErrorType } from '@/types/fetch';
import { ChatMessage, ChatMessageError } from '@/types/message';

import ErrorJsonViewer from './ErrorJsonViewer';
import InvalidAccess from './InvalidAccess';
import OpenAPIKey from './OpenAPIKey';
import OpenAiBizError from './OpenAiBizError';
import PluginSettings from './PluginSettings';

// Config for the errorMessage display
export const getErrorAlertConfig = (
  errorType?: IPluginErrorType | ILobeAgentRuntimeErrorType | IChatErrorType,
): AlertProps | undefined => {
  // OpenAIBizError / ZhipuBizError / GoogleBizError / ...
  if (typeof errorType === 'string' && errorType.includes('Biz'))
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

    case PluginErrorType.PluginSettingsInvalid:
    case ChatErrorType.InvalidAccessCode:
    case AgentRuntimeErrorType.NoOpenAIAPIKey:
    case AgentRuntimeErrorType.InvalidGoogleAPIKey:
    case AgentRuntimeErrorType.InvalidZhipuAPIKey: {
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

    case ChatErrorType.InvalidAccessCode: {
      return <InvalidAccess id={data.id} />;
    }

    // TODO: 独立的 Zhipu / Google API key 配置页面
    case AgentRuntimeErrorType.InvalidZhipuAPIKey:
    case AgentRuntimeErrorType.InvalidGoogleAPIKey:
    case AgentRuntimeErrorType.NoOpenAIAPIKey: {
      return <OpenAPIKey id={data.id} />;
    }

    default: {
      return <ErrorJsonViewer error={data.error} id={data.id} />;
    }
  }
});

export default ErrorMessageExtra;
