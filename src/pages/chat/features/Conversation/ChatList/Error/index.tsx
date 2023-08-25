import { IPluginErrorType, PluginErrorType } from '@lobehub/chat-plugin-sdk';
import { RenderErrorMessage } from '@lobehub/ui';

import { ChatErrorType, ErrorType } from '@/types/fetch';

import InvalidAccess from './InvalidAccess';
import OpenAiBizError from './OpenAiBizError';
import PluginError from './Plugin/PluginError';

export const renderErrorMessage: RenderErrorMessage = (error, message) => {
  switch (error.type as IPluginErrorType) {
    case PluginErrorType.PluginMarketIndexNotFound:
    case PluginErrorType.PluginMarketIndexInvalid:
    case PluginErrorType.PluginMetaInvalid:
    case PluginErrorType.PluginMetaNotFound:
    case PluginErrorType.PluginManifestInvalid:
    case PluginErrorType.PluginManifestNotFound:
    case PluginErrorType.PluginApiNotFound:
    case PluginErrorType.PluginSettingsInvalid:
    case PluginErrorType.PluginApiParamsError: {
      return <PluginError content={(error as any).body} id={message.id} />;
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
