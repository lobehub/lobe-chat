/**
 * OpenAI API Mock Helper
 *
 * Provides utilities to create mock OpenAI streaming responses
 * for E2E testing without hitting the real API.
 */

export interface OpenAIToolCall {
  arguments: string;
  id: string;
  name: string;
}

export interface CreateOpenAIStreamResponseOptions {
  /** Text content to stream */
  content?: string;
  /** Finish reason */
  finishReason?: 'stop' | 'tool_calls' | 'length' | 'content_filter';
  /** Model name */
  model?: string;
  /** Tool calls to include */
  toolCalls?: OpenAIToolCall[];
}

/**
 * Create an OpenAI-format streaming response
 *
 * @example
 * // Simple text response
 * createOpenAIStreamResponse({ content: 'Hello!' });
 *
 * @example
 * // Tool call response
 * createOpenAIStreamResponse({
 *   toolCalls: [{
 *     id: 'call_123',
 *     name: 'search',
 *     arguments: '{"query":"weather"}'
 *   }],
 *   finishReason: 'tool_calls'
 * });
 */
export const createOpenAIStreamResponse = (options: CreateOpenAIStreamResponseOptions): Response => {
  const { content, toolCalls, finishReason = 'stop', model = 'gpt-5' } = options;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const chatId = `chatcmpl-${Date.now()}`;

      // Send content chunks (split by characters for realistic streaming)
      if (content) {
        const chunk = {
          choices: [
            {
              delta: { content },
              finish_reason: null,
              index: 0,
            },
          ],
          id: chatId,
          model,
          object: 'chat.completion.chunk',
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
      }

      // Send tool_calls chunks
      if (toolCalls && toolCalls.length > 0) {
        for (let i = 0; i < toolCalls.length; i++) {
          const tool = toolCalls[i];
          const chunk = {
            choices: [
              {
                delta: {
                  tool_calls: [
                    {
                      function: {
                        arguments: tool.arguments,
                        name: tool.name,
                      },
                      id: tool.id,
                      index: i,
                      type: 'function',
                    },
                  ],
                },
                finish_reason: null,
                index: 0,
              },
            ],
            id: chatId,
            model,
            object: 'chat.completion.chunk',
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
        }
      }

      // Send finish chunk
      const finishChunk = {
        choices: [
          {
            delta: {},
            finish_reason: finishReason,
            index: 0,
          },
        ],
        id: chatId,
        model,
        object: 'chat.completion.chunk',
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(finishChunk)}\n\n`));

      // Send [DONE] signal
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream',
    },
  });
};

/**
 * Create an OpenAI error response
 */
export const createOpenAIErrorResponse = (
  error: string,
  statusCode = 500,
  type = 'server_error',
): Response => {
  return new Response(
    JSON.stringify({
      error: {
        code: null,
        message: error,
        param: null,
        type,
      },
    }),
    {
      headers: { 'content-type': 'application/json' },
      status: statusCode,
    },
  );
};

/**
 * Create a rate limit error response
 */
export const createOpenAIRateLimitResponse = (): Response => {
  return createOpenAIErrorResponse(
    'Rate limit reached for requests',
    429,
    'rate_limit_exceeded',
  );
};

/**
 * Helper to check if a fetch call is to OpenAI API
 */
export const isOpenAIRequest = (input: RequestInfo | URL): boolean => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  return url.includes('api.openai.com') || url.includes('openai');
};

/**
 * Create a fetch spy that only intercepts OpenAI requests
 *
 * @example
 * const { mockOpenAI, restore } = createOpenAIFetchSpy();
 *
 * mockOpenAI(createOpenAIStreamResponse({ content: 'Hello!' }));
 *
 * // ... run test ...
 *
 * restore();
 */
export const createOpenAIFetchSpy = () => {
  const originalFetch = globalThis.fetch;
  let openAIResponse: Response | null = null;

  const mockFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    if (isOpenAIRequest(input) && openAIResponse) {
      const response = openAIResponse;
      openAIResponse = null; // Reset for next call
      return response;
    }
    return originalFetch(input, init);
  };

  globalThis.fetch = mockFetch as typeof fetch;

  return {
    mockOpenAI: (response: Response) => {
      openAIResponse = response;
    },
    restore: () => {
      globalThis.fetch = originalFetch;
    },
  };
};
