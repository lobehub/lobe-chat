import { createGatewayOnEdgeRuntime } from '@lobehub/chat-plugins-gateway';

import { getJWTPayload } from '@/app/api/chat/auth';
import { createErrorResponse } from '@/app/api/errorResponse';
import { getServerConfig } from '@/config/server';
import { LOBE_CHAT_AUTH_HEADER, OAUTH_AUTHORIZED } from '@/const/auth';
import { AgentRuntimeError } from '@/libs/agent-runtime';
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
  // get Authorization from header
  const authorization = req.headers.get(LOBE_CHAT_AUTH_HEADER);
  if (!authorization) throw AgentRuntimeError.createError(ChatErrorType.Unauthorized);

  const oauthAuthorized = !!req.headers.get(OAUTH_AUTHORIZED);
  const payload = await getJWTPayload(authorization);

  const result = checkAuth(payload.accessCode!, oauthAuthorized);

  if (!result.auth) {
    return createErrorResponse(result.error as ErrorType);
  }

  return handler(req);
};
