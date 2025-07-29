import { AuthObject } from '@clerk/backend';
import { NextRequest } from 'next/server';

import {
  ClientSecretPayload,
  LOBE_CHAT_AUTH_HEADER,
  LOBE_CHAT_OIDC_AUTH_HEADER,
  OAUTH_AUTHORIZED,
  enableClerk,
} from '@/const/auth';
import { ClerkAuth } from '@/libs/clerk-auth';
import { AgentRuntime, AgentRuntimeError, ChatCompletionErrorPayload } from '@/libs/model-runtime';
import { validateOIDCJWT } from '@/libs/oidc-provider/jwt';
import { ChatErrorType } from '@/types/fetch';
import { createErrorResponse } from '@/utils/errorResponse';
import { getXorPayload } from '@/utils/server/xor';

import { checkAuthMethod } from './utils';

type CreateRuntime = (jwtPayload: ClientSecretPayload) => AgentRuntime;
type RequestOptions = { createRuntime?: CreateRuntime; params: Promise<{ provider: string }> };

export type RequestHandler = (
  req: Request,
  options: RequestOptions & {
    createRuntime?: CreateRuntime;
    jwtPayload: ClientSecretPayload;
  },
) => Promise<Response>;

export const checkAuth =
  (handler: RequestHandler) => async (req: Request, options: RequestOptions) => {
    // we have a special header to debug the api endpoint in development mode
    const isDebugApi = req.headers.get('lobe-auth-dev-backend-api') === '1';
    if (process.env.NODE_ENV === 'development' && isDebugApi) {
      return handler(req, { ...options, jwtPayload: { userId: 'DEV_USER' } });
    }

    let jwtPayload: ClientSecretPayload;

    try {
      // get Authorization from header
      const authorization = req.headers.get(LOBE_CHAT_AUTH_HEADER);
      const oauthAuthorized = !!req.headers.get(OAUTH_AUTHORIZED);

      if (!authorization) throw AgentRuntimeError.createError(ChatErrorType.Unauthorized);

      // check the Auth With payload and clerk auth
      let clerkAuth = {} as AuthObject;

      // TODO: V2 完整移除 client 模式下的 clerk 集成代码
      if (enableClerk) {
        const auth = new ClerkAuth();
        const data = auth.getAuthFromRequest(req as NextRequest);
        clerkAuth = data.clerkAuth;
      }

      jwtPayload = getXorPayload(authorization);

      const oidcAuthorization = req.headers.get(LOBE_CHAT_OIDC_AUTH_HEADER);
      let isUseOidcAuth = false;
      if (!!oidcAuthorization) {
        const oidc = await validateOIDCJWT(oidcAuthorization);

        isUseOidcAuth = true;

        jwtPayload = {
          ...jwtPayload,
          userId: oidc.userId,
        };
      }

      if (!isUseOidcAuth)
        checkAuthMethod({
          accessCode: jwtPayload.accessCode,
          apiKey: jwtPayload.apiKey,
          clerkAuth,
          nextAuthAuthorized: oauthAuthorized,
        });
    } catch (e) {
      const params = await options.params;

      // if the error is not a ChatCompletionErrorPayload, it means the application error
      if (!(e as ChatCompletionErrorPayload).errorType) {
        if ((e as any).code === 'ERR_JWT_EXPIRED')
          return createErrorResponse(ChatErrorType.SystemTimeNotMatchError, e);

        // other issue will be internal server error
        console.error(e);
        return createErrorResponse(ChatErrorType.InternalServerError, {
          error: e,
          provider: params?.provider,
        });
      }

      const {
        errorType = ChatErrorType.InternalServerError,
        error: errorContent,
        ...res
      } = e as ChatCompletionErrorPayload;

      const error = errorContent || e;

      return createErrorResponse(errorType, { error, ...res, provider: params?.provider });
    }

    return handler(req, { ...options, jwtPayload });
  };
