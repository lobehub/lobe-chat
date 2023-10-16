import { PluginErrorType } from '@lobehub/chat-plugin-sdk';
import { ChatListProps } from '@lobehub/ui';

import { ChatErrorType } from '@/types/fetch';

import InvalidAccess from './InvalidAccess';
import OpenAPIKey from './OpenAPIKey';
import OpenAiBizError from './OpenAiBizError';
import PluginError from './Plugin/PluginError';
import PluginSettings from './Plugin/PluginSettings';

export const renderErrorMessages: ChatListProps['renderErrorMessages'] = {
  [PluginErrorType.PluginMarketIndexNotFound]: PluginError,
  [PluginErrorType.PluginMarketIndexInvalid]: PluginError,
  [PluginErrorType.PluginMetaInvalid]: PluginError,
  [PluginErrorType.PluginMetaNotFound]: PluginError,
  [PluginErrorType.PluginManifestInvalid]: PluginError,
  [PluginErrorType.PluginManifestNotFound]: PluginError,
  [PluginErrorType.PluginApiNotFound]: PluginError,
  [PluginErrorType.PluginApiParamsError]: PluginError,
  [PluginErrorType.PluginServerError]: PluginError,
  [PluginErrorType.PluginSettingsInvalid]: PluginSettings,
  [ChatErrorType.InvalidAccessCode]: InvalidAccess,
  [ChatErrorType.NoAPIKey]: OpenAPIKey,
  [ChatErrorType.OpenAIBizError]: OpenAiBizError,
};
