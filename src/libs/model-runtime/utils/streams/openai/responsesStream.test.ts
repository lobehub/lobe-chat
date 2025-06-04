import { describe, expect, it, vi } from 'vitest';

import { AgentRuntimeErrorType } from '@/libs/model-runtime';

import { FIRST_CHUNK_ERROR_KEY } from '../protocol';
import { createReadableStream } from '../utils';
import { OpenAIResponsesStream } from './responsesStream';

describe('OpenAIResponsesStream', () => {
  it('should transform OpenAI stream to protocol stream', async () => {
    const mockOpenAIStream = createReadableStream([
      {
        type: 'response.created',
        response: {
          id: 'resp_683e7b8ca3308190b6837f20d2c015cd0cf93af363cdcf58',
          object: 'response',
          created_at: 1748925324,
          status: 'in_progress',
          error: null,
          incomplete_details: null,
          instructions: null,
          max_output_tokens: null,
          model: 'o4-mini',
          output: [],
          parallel_tool_calls: true,
          previous_response_id: null,
          reasoning: { effort: 'medium', summary: null },
          service_tier: 'auto',
          store: false,
          temperature: 1,
          text: { format: { type: 'text' } },
          tool_choice: 'auto',
          tools: [
            {
              type: 'function',
              description:
                'a search service. Useful for when you need to answer questions about current events. Input should be a search query. Output is a JSON array of the query results',
              name: 'lobe-web-browsing____search____builtin',
              parameters: {
                properties: {
                  query: { description: 'The search query', type: 'string' },
                  searchCategories: {
                    description: 'The search categories you can set:',
                    items: {
                      enum: ['general', 'images', 'news', 'science', 'videos'],
                      type: 'string',
                    },
                    type: 'array',
                  },
                  searchEngines: {
                    description: 'The search engines you can use:',
                    items: {
                      enum: [
                        'google',
                        'bilibili',
                        'bing',
                        'duckduckgo',
                        'npm',
                        'pypi',
                        'github',
                        'arxiv',
                        'google scholar',
                        'z-library',
                        'reddit',
                        'imdb',
                        'brave',
                        'wikipedia',
                        'pinterest',
                        'unsplash',
                        'vimeo',
                        'youtube',
                      ],
                      type: 'string',
                    },
                    type: 'array',
                  },
                  searchTimeRange: {
                    description: 'The time range you can set:',
                    enum: ['anytime', 'day', 'week', 'month', 'year'],
                    type: 'string',
                  },
                },
                required: ['query'],
                type: 'object',
              },
              strict: true,
            },
            {
              type: 'function',
              description:
                'A crawler can visit page content. Output is a JSON object of title, content, url and website',
              name: 'lobe-web-browsing____crawlSinglePage____builtin',
              parameters: {
                properties: { url: { description: 'The url need to be crawled', type: 'string' } },
                required: ['url'],
                type: 'object',
              },
              strict: true,
            },
            {
              type: 'function',
              description:
                'A crawler can visit multi pages. If need to visit multi website, use this one. Output is an array of JSON object of title, content, url and website',
              name: 'lobe-web-browsing____crawlMultiPages____builtin',
              parameters: {
                properties: {
                  urls: {
                    items: { description: 'The urls need to be crawled', type: 'string' },
                    type: 'array',
                  },
                },
                required: ['urls'],
                type: 'object',
              },
              strict: true,
            },
          ],
          top_p: 1,
          truncation: 'disabled',
          usage: null,
          user: null,
          metadata: {},
        },
      },
      {
        type: 'response.in_progress',
        response: {
          id: 'resp_683e7b8ca3308190b6837f20d2c015cd0cf93af363cdcf58',
          object: 'response',
          created_at: 1748925324,
          status: 'in_progress',
          error: null,
          incomplete_details: null,
          instructions: null,
          max_output_tokens: null,
          model: 'o4-mini',
          output: [],
          parallel_tool_calls: true,
          previous_response_id: null,
          reasoning: { effort: 'medium', summary: null },
          service_tier: 'auto',
          store: false,
          temperature: 1,
          text: { format: { type: 'text' } },
          tool_choice: 'auto',
          tools: [
            {
              type: 'function',
              description:
                'a search service. Useful for when you need to answer questions about current events. Input should be a search query. Output is a JSON array of the query results',
              name: 'lobe-web-browsing____search____builtin',
              parameters: {
                properties: {
                  query: { description: 'The search query', type: 'string' },
                  searchCategories: {
                    description: 'The search categories you can set:',
                    items: {
                      enum: ['general', 'images', 'news', 'science', 'videos'],
                      type: 'string',
                    },
                    type: 'array',
                  },
                  searchEngines: {
                    description: 'The search engines you can use:',
                    items: {
                      enum: [
                        'google',
                        'bilibili',
                        'bing',
                        'duckduckgo',
                        'npm',
                        'pypi',
                        'github',
                        'arxiv',
                        'google scholar',
                        'z-library',
                        'reddit',
                        'imdb',
                        'brave',
                        'wikipedia',
                        'pinterest',
                        'unsplash',
                        'vimeo',
                        'youtube',
                      ],
                      type: 'string',
                    },
                    type: 'array',
                  },
                  searchTimeRange: {
                    description: 'The time range you can set:',
                    enum: ['anytime', 'day', 'week', 'month', 'year'],
                    type: 'string',
                  },
                },
                required: ['query'],
                type: 'object',
              },
              strict: true,
            },
            {
              type: 'function',
              description:
                'A crawler can visit page content. Output is a JSON object of title, content, url and website',
              name: 'lobe-web-browsing____crawlSinglePage____builtin',
              parameters: {
                properties: { url: { description: 'The url need to be crawled', type: 'string' } },
                required: ['url'],
                type: 'object',
              },
              strict: true,
            },
            {
              type: 'function',
              description:
                'A crawler can visit multi pages. If need to visit multi website, use this one. Output is an array of JSON object of title, content, url and website',
              name: 'lobe-web-browsing____crawlMultiPages____builtin',
              parameters: {
                properties: {
                  urls: {
                    items: { description: 'The urls need to be crawled', type: 'string' },
                    type: 'array',
                  },
                },
                required: ['urls'],
                type: 'object',
              },
              strict: true,
            },
          ],
          top_p: 1,
          truncation: 'disabled',
          usage: null,
          user: null,
          metadata: {},
        },
      },
      {
        type: 'response.output_item.added',
        output_index: 0,
        item: {
          id: 'rs_683e7bc80a9c81908f6e3d61ad63cc1e0cf93af363cdcf58',
          type: 'reasoning',
          summary: [],
        },
      },
      {
        type: 'response.output_item.added',
        output_index: 1,
        item: {
          id: 'msg_683e7bde8b0c8190970ab8c719c0fc1c0cf93af363cdcf58',
          type: 'message',
          status: 'in_progress',
          content: [],
          role: 'assistant',
        },
      },
      {
        type: 'response.content_part.added',
        item_id: 'msg_683e7bde8b0c8190970ab8c719c0fc1c0cf93af363cdcf58',
        output_index: 1,
        content_index: 0,
        part: { type: 'output_text', annotations: [], text: '杭州' },
      },
    ]);

    const onStartMock = vi.fn();
    const onTextMock = vi.fn();
    const onCompletionMock = vi.fn();

    const protocolStream = OpenAIResponsesStream(mockOpenAIStream, {
      callbacks: {
        onStart: onStartMock,
        onText: onTextMock,
        onCompletion: onCompletionMock,
      },
    });

    const decoder = new TextDecoder();
    const chunks = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    expect(chunks).toEqual([
      'id: 1\n',
      'event: text\n',
      `data: "Hello"\n\n`,
      'id: 1\n',
      'event: text\n',
      `data: " world!"\n\n`,
      'id: 1\n',
      'event: stop\n',
      `data: "stop"\n\n`,
    ]);

    expect(onStartMock).toHaveBeenCalledTimes(1);
    expect(onTextMock).toHaveBeenNthCalledWith(1, 'Hello');
    expect(onTextMock).toHaveBeenNthCalledWith(2, ' world!');
    expect(onCompletionMock).toHaveBeenCalledTimes(1);
  });
});
