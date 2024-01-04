import { PluginErrorType } from '@lobehub/chat-plugin-sdk';

import { ChatErrorType } from '@/types/fetch';

import { RenderErrorMessage } from '../types';
import InvalidAccess from './InvalidAccess';
import OpenAPIKey from './OpenAPIKey';
import OpenAiBizError from './OpenAiBizError';
import PluginError from './Plugin/PluginError';
import PluginSettings from './Plugin/PluginSettings';

export const renderErrorMessages: Record<string, RenderErrorMessage> = {
  [PluginErrorType.PluginMarketIndexNotFound]: {
    Render: PluginError,
  },
  [PluginErrorType.PluginMarketIndexInvalid]: {
    Render: PluginError,
  },
  [PluginErrorType.PluginMetaInvalid]: {
    Render: PluginError,
  },
  [PluginErrorType.PluginMetaNotFound]: {
    Render: PluginError,
  },
  [PluginErrorType.PluginManifestInvalid]: {
    Render: PluginError,
  },
  [PluginErrorType.PluginManifestNotFound]: {
    Render: PluginError,
  },
  [PluginErrorType.PluginApiNotFound]: {
    Render: PluginError,
  },
  [PluginErrorType.PluginApiParamsError]: {
    Render: PluginError,
  },
  [PluginErrorType.PluginServerError]: {
    Render: PluginError,
  },
  [PluginErrorType.PluginGatewayError]: {
    Render: PluginError,
  },
  [PluginErrorType.PluginOpenApiInitError]: {
    Render: PluginError,
  },
  [PluginErrorType.PluginSettingsInvalid]: {
    Render: PluginSettings,
    config: {
      extraDefaultExpand: true,
      extraIsolate: true,
      type: 'warning',
    },
  },
  [ChatErrorType.InvalidAccessCode]: {
    Render: InvalidAccess,
    config: {
      extraDefaultExpand: true,
      extraIsolate: true,
      type: 'warning',
    },
  },
  [ChatErrorType.NoAPIKey]: {
    Render: OpenAPIKey,
    config: {
      extraDefaultExpand: true,
      extraIsolate: true,
      type: 'warning',
    },
  },
  [ChatErrorType.OpenAIBizError]: {
    Render: OpenAiBizError,
    config: {
      extraDefaultExpand: true,
      extraIsolate: true,
      type: 'warning',
    },
  },
};
