import { IPluginErrorType, PluginErrorType } from '@lobehub/chat-plugin-sdk';
import { RenderErrorMessage } from '@lobehub/ui';

import { ChatMessage } from '@/types/chatMessage';
import { ChatErrorType, ErrorType } from '@/types/fetch';

import InvalidAccess from './InvalidAccess';
import OpenAiBizError from './OpenAiBizError';
import PluginError from './Plugin/PluginError';
import PluginSettings from './Plugin/PluginSettings';

export const renderErrorMessage: RenderErrorMessage = (error, message: ChatMessage) => {
  switch (error.type as IPluginErrorType) {
    case PluginErrorType.PluginMarketIndexNotFound:
    case PluginErrorType.PluginMarketIndexInvalid:
    case PluginErrorType.PluginMetaInvalid:
    case PluginErrorType.PluginMetaNotFound:
    case PluginErrorType.PluginManifestInvalid:
    case PluginErrorType.PluginManifestNotFound:
    case PluginErrorType.PluginApiNotFound:
    case PluginErrorType.PluginApiParamsError: {
      return <PluginError content={(error as any).body} id={message.id} />;
    }
    case PluginErrorType.PluginSettingsInvalid: {
      return (
        message.plugin?.identifier && (
          <PluginSettings id={message.id} pluginIdentifier={message.plugin?.identifier} />
        )
      );
    }
  }

  switch (error.type as ErrorType) {
    case ChatErrorType.InvalidAccessCode: {
      return <InvalidAccess id={message.id} />;
    }

    case ChatErrorType.OpenAIBizError: {
      return <OpenAiBizError content={(error as any).body} id={message.id} />;
    }
  }
};
