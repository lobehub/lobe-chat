import { IPluginErrorType, PluginErrorType } from '@lobehub/chat-plugin-sdk';
import type { AlertProps } from '@lobehub/ui';
import { memo } from 'react';

import { AgentRuntimeErrorType, ILobeAgentRuntimeErrorType } from '@/libs/agent-runtime';
import { ChatMessage, ChatMessageError } from '@/types/message';

import ErrorJsonViewer from './ErrorJsonViewer';
import InvalidAccess from './InvalidAccess';
import OpenAPIKey from './OpenAPIKey';
import OpenAiBizError from './OpenAiBizError';
import PluginSettings from './PluginSettings';

// Config for the errorMessage display
export const getErrorAlertConfig = (
  errorType?: IPluginErrorType | ILobeAgentRuntimeErrorType,
): AlertProps | undefined => {
  switch (errorType) {
    case PluginErrorType.PluginSettingsInvalid:
    case AgentRuntimeErrorType.InvalidAccessCode:
    case AgentRuntimeErrorType.NoOpenAIAPIKey:
    case AgentRuntimeErrorType.OpenAIBizError:
    case AgentRuntimeErrorType.ZhipuBizError:
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

    case AgentRuntimeErrorType.InvalidAccessCode: {
      return <InvalidAccess id={data.id} />;
    }

    // TODO: 独立的Zhipu api key 配置页面
    case AgentRuntimeErrorType.InvalidZhipuAPIKey:
    case AgentRuntimeErrorType.NoOpenAIAPIKey: {
      return <OpenAPIKey id={data.id} />;
    }

    default: {
      return <ErrorJsonViewer error={data.error} id={data.id} />;
    }
  }
});

export default ErrorMessageExtra;
