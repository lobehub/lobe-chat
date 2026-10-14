import {
  formatServerDefaultHeterogeneousModel,
  isServerDefaultHeterogeneousModel,
} from '@lobechat/types';
import { isRecord } from '@lobechat/utils/object';
import type { Context } from 'hono';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

import type { HeteroOperationJwtClaims } from '@/libs/trpc/utils/internalJwt';

import { requireHeteroModelInvocation } from '../middleware/hetero-operation-auth';
import {
  encodeChatCompletionsStream,
  normalizeChatCompletionsRequest,
} from '../services/heterogeneous-chat-completions.service';
import {
  describeRelayFailure,
  invokeServerDefaultModel,
  SERVER_DEFAULT_MODEL_ALIAS,
} from '../services/heterogeneous-direct.service';

export const heterogeneousChatCompletionsRoutes = new Hono();

heterogeneousChatCompletionsRoutes.post(
  '/v1/chat/completions',
  requireHeteroModelInvocation('openai-chat-completions'),
  async (c) => {
    const request = await c.req.json().catch(() => null);
    if (!isRecord(request) || !Array.isArray(request.messages) || request.messages.length === 0) {
      throw new HTTPException(400, { message: 'A non-empty messages array is required' });
    }
    const context = c as Context;
    const claims = context.get('heteroOperationClaims') as HeteroOperationJwtClaims;
    if (!claims.provider_id || !claims.model)
      throw new HTTPException(403, { message: 'Operation token has no server model selection' });
    if (!isServerDefaultHeterogeneousModel(request.model, claims.model))
      throw new HTTPException(400, { message: 'model must match the server operation selection' });
    if (request.stream !== true)
      throw new HTTPException(400, {
        message: 'server-default Chat Completions requests must stream',
      });
    const workspaceId = context.get('workspaceId');
    try {
      const { response } = await invokeServerDefaultModel({
        agentType: context.get('heteroAgentType'),
        model: claims.model,
        payload: normalizeChatCompletionsRequest(request, SERVER_DEFAULT_MODEL_ALIAS),
        signal: c.req.raw.signal,
        userId: String(context.get('userId')),
        workspaceId: typeof workspaceId === 'string' ? workspaceId : undefined,
      });
      if (!response.body)
        return c.json(
          { error: { message: 'Upstream returned no stream', type: 'api_error' } },
          502,
        );
      return new Response(
        encodeChatCompletionsStream(
          response.body,
          formatServerDefaultHeterogeneousModel(claims.model),
        ),
        {
          headers: { 'Cache-Control': 'no-cache', 'Content-Type': 'text/event-stream' },
        },
      );
    } catch (error) {
      const { message, retryable, status } = describeRelayFailure(error);
      return c.json({ error: { message, type: 'api_error' } }, status, {
        'x-should-retry': String(retryable),
      });
    }
  },
);
