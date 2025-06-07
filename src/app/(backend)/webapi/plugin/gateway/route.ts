import { PluginRequestPayload } from '@lobehub/chat-plugin-sdk';
import { createGatewayOnEdgeRuntime } from '@lobehub/chat-plugins-gateway';

import { LOBE_CHAT_AUTH_HEADER, OAUTH_AUTHORIZED, enableNextAuth } from '@/const/auth';
import { LOBE_CHAT_TRACE_ID, TraceNameMap } from '@/const/trace';
import { getAppConfig } from '@/envs/app';
import { AgentRuntimeError } from '@/libs/model-runtime';
import { TraceClient } from '@/libs/traces';
import { ChatErrorType, ErrorType } from '@/types/fetch';
import { createErrorResponse } from '@/utils/errorResponse';
import { getJWTPayload } from '@/utils/server/jwt';
import { getTracePayload } from '@/utils/trace';

import { parserPluginSettings } from './settings';

const checkAuth = (accessCode: string | null, oauthAuthorized: boolean | null) => {
  const { ACCESS_CODES, PLUGIN_SETTINGS } = getAppConfig();

  // if there is no plugin settings, just skip the auth
  if (!PLUGIN_SETTINGS) return { auth: true };

  // If authorized by oauth
  if (oauthAuthorized && enableNextAuth) return { auth: true };

  // if accessCode doesn't exist
  if (!ACCESS_CODES.length) return { auth: true };

  if (!accessCode || !ACCESS_CODES.includes(accessCode)) {
    return { auth: false, error: ChatErrorType.InvalidAccessCode };
  }

  return { auth: true };
};

const { PLUGINS_INDEX_URL: pluginsIndexUrl, PLUGIN_SETTINGS } = getAppConfig();

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

  // TODO: need to be replace by better telemetry system
  // add trace
  const tracePayload = getTracePayload(req);
  const traceClient = new TraceClient();
  const trace = traceClient.createTrace({
    id: tracePayload?.traceId,
    ...tracePayload,
  });

  const { manifest, indexUrl, ...input } = (await req.clone().json()) as PluginRequestPayload;

  const span = trace?.span({
    input,
    metadata: { indexUrl, manifest },
    name: TraceNameMap.FetchPluginAPI,
  });

  span?.update({ parentObservationId: tracePayload?.observationId });

  const res = await handler(req);

  span?.end({ output: await res.clone().text() });

  if (trace?.id) {
    res.headers.set(LOBE_CHAT_TRACE_ID, trace.id);
  }

  return res;
};
