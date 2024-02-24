import { createGatewayOnEdgeRuntime } from '@lobehub/chat-plugins-gateway';

import { createErrorResponse } from '@/app/api/errorResponse';
import { getServerConfig } from '@/config/server';
import { getOpenAIAuthFromRequest } from '@/const/fetch';
import { ChatErrorType, ErrorType } from '@/types/fetch';

import { parserPluginSettings } from './settings';

const checkAuth = (accessCode: string | null, oauthAuthorized: boolean | null) => {
  const { ACCESS_CODES, PLUGIN_SETTINGS, ENABLE_OAUTH_SSO } = getServerConfig();

  // if there is no plugin settings, just skip the auth
  if (!PLUGIN_SETTINGS) return { auth: true };

  // If authorized by oauth
  if (oauthAuthorized && ENABLE_OAUTH_SSO) return { auth: true };

  // if accessCode doesn't exist
  if (!ACCESS_CODES.length) return { auth: true };

  if (!accessCode || !ACCESS_CODES.includes(accessCode)) {
    return { auth: false, error: ChatErrorType.InvalidAccessCode };
  }

  return { auth: true };
};

const { PLUGINS_INDEX_URL: pluginsIndexUrl, PLUGIN_SETTINGS } = getServerConfig();

const defaultPluginSettings = parserPluginSettings(PLUGIN_SETTINGS);

const handler = createGatewayOnEdgeRuntime({ defaultPluginSettings, pluginsIndexUrl });

export const POST = async (req: Request) => {
  const { accessCode, oauthAuthorized } = getOpenAIAuthFromRequest(req);

  const result = checkAuth(accessCode, oauthAuthorized);

  if (!result.auth) {
    return createErrorResponse(result.error as ErrorType);
  }

  return handler(req);
};
