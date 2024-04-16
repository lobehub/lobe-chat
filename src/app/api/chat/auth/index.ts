import { createErrorResponse } from '@/app/api/errorResponse';
import { JWTPayload, LOBE_CHAT_AUTH_HEADER, OAUTH_AUTHORIZED } from '@/const/auth';
import { AgentRuntimeError, ChatCompletionErrorPayload } from '@/libs/agent-runtime';
import { ChatErrorType } from '@/types/fetch';

import { checkAuthMethod, getJWTPayload } from './utils';

type RequestOptions = { params: { provider: string } };

export type RequestHandler = (
  req: Request,
  options: RequestOptions & { jwtPayload: JWTPayload },
) => Promise<Response>;

export const checkAuth =
  (handler: RequestHandler) => async (req: Request, options: RequestOptions) => {
    let jwtPayload: JWTPayload;

    try {
      // get Authorization from header
      const authorization = req.headers.get(LOBE_CHAT_AUTH_HEADER);
      const oauthAuthorized = !!req.headers.get(OAUTH_AUTHORIZED);

      if (!authorization) throw AgentRuntimeError.createError(ChatErrorType.Unauthorized);

      // check the Auth With payload
      jwtPayload = await getJWTPayload(authorization);
      checkAuthMethod(jwtPayload.accessCode, jwtPayload.apiKey, oauthAuthorized);
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
