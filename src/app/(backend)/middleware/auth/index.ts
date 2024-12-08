import { AuthObject } from '@clerk/backend';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

import { JWTPayload, LOBE_CHAT_AUTH_HEADER, OAUTH_AUTHORIZED, enableClerk } from '@/const/auth';
import { AgentRuntime, AgentRuntimeError, ChatCompletionErrorPayload } from '@/libs/agent-runtime';
import { ChatErrorType } from '@/types/fetch';
import { createErrorResponse } from '@/utils/errorResponse';
import { getJWTPayload } from '@/utils/server/jwt';

import { checkAuthMethod } from './utils';

type CreateRuntime = (jwtPayload: JWTPayload) => AgentRuntime;
type RequestOptions = { createRuntime?: CreateRuntime; params: { provider: string } };

export type RequestHandler = (
  req: Request,
  options: RequestOptions & {
    createRuntime?: CreateRuntime;
    jwtPayload: JWTPayload;
  },
) => Promise<Response>;

export const checkAuth =
  (handler: RequestHandler) => async (req: Request, options: RequestOptions) => {
    let jwtPayload: JWTPayload;

    try {
      // 1. 获取认证头
      const authorization = req.headers.get(LOBE_CHAT_AUTH_HEADER);
      const oauthAuthorized = !!req.headers.get(OAUTH_AUTHORIZED);

      if (!authorization) throw AgentRuntimeError.createError(ChatErrorType.Unauthorized);

      // 2. 检查 Clerk 认证
      let clerkAuth = {} as AuthObject;
      if (enableClerk) {
        clerkAuth = getAuth(req as NextRequest);
      }

      // 3. 获取 JWT Payload
      jwtPayload = await getJWTPayload(authorization);

      // 4. 检查认证方法
      checkAuthMethod({
        accessCode: jwtPayload.accessCode,
        apiKey: jwtPayload.apiKey,
        clerkAuth,
        nextAuthAuthorized: oauthAuthorized,
      });
    } catch (e) {
      const {
        errorType = ChatErrorType.InternalServerError,
        error: errorContent,
        ...res
      } = e as ChatCompletionErrorPayload;

      const error = errorContent || e;

      return createErrorResponse(errorType, { error, ...res, provider: options.params?.provider });
    }

    return handler(req, { ...options, jwtPayload });
  };
