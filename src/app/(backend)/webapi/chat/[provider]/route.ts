import { checkAuth } from '@/app/(backend)/middleware/auth';
import {
  AGENT_RUNTIME_ERROR_SET,
  AgentRuntime,
  ChatCompletionErrorPayload,
} from '@/libs/model-runtime';
import { createTraceOptions, initAgentRuntimeWithUserPayload } from '@/server/modules/AgentRuntime';
import { ChatErrorType } from '@/types/fetch';
import { ChatStreamPayload } from '@/types/openai/chat';
import { createErrorResponse } from '@/utils/errorResponse';
import { getTracePayload } from '@/utils/trace';

import { prependInitialChunkToStream } from './prependInitialChunkToStream';

export const runtime = 'edge';

export const POST = checkAuth(async (req: Request, { params, jwtPayload, createRuntime }) => {
  const { provider } = await params;

  try {
    // ============  1. init chat model   ============ //
    let agentRuntime: AgentRuntime;
    if (createRuntime) {
      agentRuntime = createRuntime(jwtPayload);
    } else {
      agentRuntime = await initAgentRuntimeWithUserPayload(provider, jwtPayload);
    }

    // ============  2. create chat completion   ============ //

    const data = (await req.json()) as ChatStreamPayload;

    const tracePayload = getTracePayload(req);

    let traceOptions = {};
    // If user enable trace
    if (tracePayload?.enabled) {
      traceOptions = createTraceOptions(data, { provider, trace: tracePayload });
    }

    // Call agentRuntime.chat to get the original Response object
    const originalResponse = await agentRuntime.chat(data, {
      user: jwtPayload.userId,
      ...traceOptions,
      signal: req.signal,
    });

    // Check if the original response was successful and has a body
    if (!originalResponse.ok || !originalResponse.body) {
      // If the underlying chat call failed or didn't return a streamable body,
      // return it as is. It might be an error response from the runtime itself.
      console.warn('Original response from agentRuntime.chat was not ok or had no body.');
      return originalResponse;
    }

    // ***** HEARTBEAT MODIFICATION START *****
    const encoder = new TextEncoder();
    // Send a single space as a minimal heartbeat.
    // Adjust as needed (e.g., for SSE: encoder.encode(':\n\n') or a specific event)
    const heartbeatChunk = encoder.encode(' ');

    // originalResponse.body should be ReadableStream<Uint8Array>
    const streamWithHeartbeat = prependInitialChunkToStream(
      originalResponse.body as ReadableStream<Uint8Array>, // Cast if necessary, but Response.body should be this type
      heartbeatChunk,
    );

    // Create a new Response with the modified stream and original headers/status
    return new Response(streamWithHeartbeat, {
      headers: originalResponse.headers,
      status: originalResponse.status,
      statusText: originalResponse.statusText, // Preserve original headers (like Content-Type)
    });
  } catch (e) {
    const {
      errorType = ChatErrorType.InternalServerError,
      error: errorContent,
      ...res
    } = e as ChatCompletionErrorPayload;

    const error = errorContent || e;

    const logMethod = AGENT_RUNTIME_ERROR_SET.has(errorType as string) ? 'warn' : 'error';
    // track the error at server side
    console[logMethod](`Route: [${provider}] ${errorType}:`, error);

    return createErrorResponse(errorType, { error, ...res, provider });
  }
});
