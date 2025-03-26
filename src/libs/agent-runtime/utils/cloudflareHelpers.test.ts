// @vitest-environment node
import type * as CloudflareAI from 'cloudflare/resources/workers/ai/ai';
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ChatCompletionTool, OpenAIChatMessage } from '../types';
import * as desensitizeTool from '../utils/desensitizeUrl';
import {
  CloudflareStreamTransformer,
  desensitizeCloudflareUrl,
  fillUrl,
  getModelBeta,
  getModelDisplayName,
  getModelFunctionCalling,
  getModelTokens,
  modifyTools,
  removePluginInfo,
} from './cloudflareHelpers';

declare module './cloudflareHelpers' {
  function getModelBeta(model: any): boolean;
  function getModelDisplayName(model: any, beta: boolean): string;
  function getModelFunctionCalling(model: any): boolean;
  function getModelTokens(model: any): number | undefined;
}

type CloudflareAITool = CloudflareAI.AIRunParams.Variant7.Tool;

afterEach(() => {
  vi.restoreAllMocks();
});

describe('cloudflareHelpers', () => {
  describe('CloudflareStreamTransformer', () => {
    let transformer: CloudflareStreamTransformer;
    beforeEach(() => {
      transformer = new CloudflareStreamTransformer();
    });

    describe('constructor', () => {
      describe('stream', () => {
        const testCases = [true, false, undefined];
        testCases.forEach((stream) => {
          it(`should set stream to ${stream}`, () => {
            // Act
            const transformer = new CloudflareStreamTransformer(stream);

            // Assert
            expect(transformer['stream']).toBe(stream);
          });
        });
      });
    });

    describe('transformDispatch', () => {
      let chunk: Uint8Array;
      let controller: TransformStreamDefaultController;
      beforeEach(() => {
        chunk = new Uint8Array();
        controller = Object.create(TransformStreamDefaultController.prototype);
        if (!transformer) {
          throw new Error('transformer is undefined');
        }
        vi.spyOn(transformer as any, 'transformStream').mockImplementation(async (_, __) => {});
        vi.spyOn(transformer as any, 'transformNonStream').mockImplementation(async (_, __) => {});
      });

      it('should call transformStream when stream is true', async () => {
        // Arrange
        transformer['stream'] = true;

        // Act
        await transformer.transform(chunk, controller);

        // Assert
        expect(transformer['transformStream']).toHaveBeenCalled(); // Why does toHaveBeenCalledWith here throw undefined error?
      });

      it('should call transformStream when stream is undefined', async () => {
        // Arrange
        transformer['stream'] = undefined;

        // Act
        await transformer.transform(chunk, controller);

        // Assert
        expect(transformer['transformStream']).toHaveBeenCalled();
      });

      it('should call transformNonStream when stream is undefined', async () => {
        // Arrange
        transformer['stream'] = false;

        // Act
        await transformer.transform(chunk, controller);

        // Assert
        expect(transformer['transformNonStream']).toHaveBeenCalled();
      });
    });

    describe('parseChunk', () => {
      let chunks: string[];
      let controller: TransformStreamDefaultController;

      beforeEach(() => {
        chunks = [];
        controller = Object.create(TransformStreamDefaultController.prototype);
        vi.spyOn(controller, 'enqueue').mockImplementation((chunk) => {
          chunks.push(chunk);
        });
      });

      it('should parse chunk', () => {
        // Arrange
        const chunk = 'data: {"key": "value", "response": "response1"}';

        // Act
        transformer['parseChunk'](chunk, controller);

        // Assert
        expect(chunks.length).toBe(2);
        expect(chunks[0]).toBe('event: text\n');
        expect(chunks[1]).toBe('data: "response1"\n\n');
      });

      it('should not replace `data` in text', () => {
        // Arrange
        const chunk = 'data: {"key": "value", "response": "data: a"}';

        // Act
        transformer['parseChunk'](chunk, controller);

        // Assert
        expect(chunks.length).toBe(2);
        expect(chunks[0]).toBe('event: text\n');
        expect(chunks[1]).toBe('data: "data: a"\n\n');
      });

      it('should stop at <|im_end|>', () => {
        // Arrange
        const chunk = 'data: {"key": "value", "response": "<|im_end|>"}';

        // Act
        transformer['parseChunk'](chunk, controller);

        // Assert
        expect(chunks.length).toBe(2);
        expect(chunks[0]).toBe('event: stop\n');
        expect(chunks[1]).toBe('data: "<|im_end|>"\n\n');
      });
    });

    describe('transform', () => {
      const textEncoder = new TextEncoder();
      let chunks: string[];

      beforeEach(() => {
        chunks = [];
      });

      describe('transformStream', () => {
        beforeEach(() => {
          vi.spyOn(
            transformer as any as {
              parseChunk: (chunk: string, controller: TransformStreamDefaultController) => void;
            },
            'parseChunk',
          ).mockImplementation((chunk: string, _) => {
            chunks.push(chunk);
          });
        });

        it('should split single chunk', async () => {
          // Arrange
          const chunk = textEncoder.encode('data: {"key": "value", "response": "response1"}\n\n');

          // Act
          await transformer['transformStream'](chunk, undefined!);

          // Assert
          expect(chunks.length).toBe(1);
          expect(chunks[0]).toBe('data: {"key": "value", "response": "response1"}');
        });

        it('should split multiple chunks', async () => {
          // Arrange
          const chunk = textEncoder.encode(
            'data: {"key": "value", "response": "response1"}\n\n' +
              'data: {"key": "value", "response": "response2"}\n\n',
          );

          // Act
          await transformer['transformStream'](chunk, undefined!);

          // Assert
          expect(chunks.length).toBe(2);
          expect(chunks[0]).toBe('data: {"key": "value", "response": "response1"}');
          expect(chunks[1]).toBe('data: {"key": "value", "response": "response2"}');
        });

        it('should ignore empty chunk', async () => {
          // Arrange
          const chunk = textEncoder.encode('\n\n');

          // Act
          await transformer['transformStream'](chunk, undefined!);

          // Assert
          expect(chunks.join()).toBe('');
        });

        it('should split and concat delayed chunks', async () => {
          // Arrange
          const chunk1 = textEncoder.encode('data: {"key": "value", "respo');
          const chunk2 = textEncoder.encode('nse": "response1"}\n\ndata: {"key": "val');
          const chunk3 = textEncoder.encode('ue", "response": "response2"}\n\n');

          // Act & Assert
          await transformer['transformStream'](chunk1, undefined!);
          expect(transformer['parseChunk']).not.toHaveBeenCalled();
          expect(chunks.length).toBe(0);
          expect(transformer['buffer']).toBe('data: {"key": "value", "respo');

          await transformer['transformStream'](chunk2, undefined!);
          expect(chunks.length).toBe(1);
          expect(chunks[0]).toBe('data: {"key": "value", "response": "response1"}');
          expect(transformer['buffer']).toBe('data: {"key": "val');

          await transformer['transformStream'](chunk3, undefined!);
          expect(chunks.length).toBe(2);
          expect(chunks[1]).toBe('data: {"key": "value", "response": "response2"}');
          expect(transformer['buffer']).toBe('');
        });

        it('should ignore standalone [DONE]', async () => {
          // Arrange
          const chunk = textEncoder.encode('data: [DONE]\n\n');

          // Act
          await transformer['transformStream'](chunk, undefined!);

          // Assert
          expect(transformer['parseChunk']).not.toHaveBeenCalled();
          expect(chunks.length).toBe(0);
          expect(transformer['buffer']).toBe('');
        });

        it('should ignore [DONE] in chunk', async () => {
          // Arrange
          const chunk = textEncoder.encode(
            'data: {"key": "value", "response": "response1"}\n\ndata: [DONE]\n\n',
          );

          // Act
          await transformer['transformStream'](chunk, undefined!);

          // Assert
          expect(chunks.length).toBe(1);
          expect(chunks[0]).toBe('data: {"key": "value", "response": "response1"}');
          expect(transformer['buffer']).toBe('');
        });
      });

      describe('transformNonStream', () => {
        let controller: TransformStreamDefaultController;

        beforeEach(() => {
          controller = Object.create(TransformStreamDefaultController.prototype);
          vi.spyOn(controller, 'enqueue').mockImplementation((chunk) => {
            chunks.push(chunk);
          });
        });

        it('should parse text response', async () => {
          // Arrange
          const chunk = textEncoder.encode('{"result": {"key": "value", "response": "result1"}}');

          // Act
          await transformer['transformNonStream'](chunk, controller);

          // Assert
          expect(chunks.length).toBe(2);
          expect(chunks[0]).toBe('event: text\n');
          expect(chunks[1]).toBe('data: "result1"\n\n');
        });

        it('should parse tool response', async () => {
          // Arrange
          const chunk = textEncoder.encode(
            '{"result": {"response": null, "tool_calls": [{"key": "value"}]}}',
          );
          vi.spyOn(CloudflareStreamTransformer as any, 'enqueueToolCalls').mockImplementation(
            (_, controller: any) => {
              controller.enqueue('event: tool_calls\n');
              controller.enqueue('data: [{"key": "value"}]\n\n');
            },
          );

          // Act
          await transformer['transformNonStream'](chunk, controller);

          // Assert
          expect(chunks.length).toBe(2);
          expect(chunks[0]).toBe('event: tool_calls\n');
          expect(chunks[1]).toBe('data: [{"key": "value"}]\n\n');
          expect(CloudflareStreamTransformer['enqueueToolCalls']).toHaveBeenCalled();
        });

        it('should combine text and tool response', async () => {
          // Arrange
          const chunk = textEncoder.encode(
            '{"result": {"key": "value", "response": "result1", "tool_calls": [{"key": "value"}]}}',
          );
          vi.spyOn(CloudflareStreamTransformer as any, 'enqueueToolCalls').mockImplementation(
            (_, controller: any) => {
              controller.enqueue('event: tool_calls\n');
              controller.enqueue('data: [{"key": "value"}]\n\n');
            },
          );

          // Act
          await transformer['transformNonStream'](chunk, controller);

          // Assert
          expect(chunks.length).toBe(4);
          expect(chunks[0]).toBe('event: text\n');
          expect(chunks[1]).toBe('data: "result1"\n\n');
          expect(chunks[2]).toBe('event: tool_calls\n');
          expect(chunks[3]).toBe('data: [{"key": "value"}]\n\n');
          expect(CloudflareStreamTransformer['enqueueToolCalls']).toHaveBeenCalled();
        });
      });

      describe('getRandomId', () => {
        it('should contain prefix', () => {
          // Arrange
          const prefix = 'prefix';
          const length = 8;

          // Act
          const id = CloudflareStreamTransformer['getRandomId'](prefix, length);

          // Assert
          expect(id).toSatisfy((id: string) => id.startsWith(prefix));
        });

        it('should have correct length', () => {
          // Arrange
          const prefix = 'prefix';
          const length = 8;
          const expectedLength = prefix.length + length;

          // Act
          const id = CloudflareStreamTransformer['getRandomId'](prefix, length);
          const idLength = id.length;

          // Assert
          expect(idLength).toBe(expectedLength);
        });

        it('should contain only alphanumeric characters', () => {
          // Arrange
          const prefix = '';
          const length = 32;

          // Act
          const id = CloudflareStreamTransformer['getRandomId'](prefix, length);

          // Assert
          expect(id).toMatch(/^[a-zA-Z0-9]+$/);
        });

        it('should be unique', () => {
          // Arrange
          const prefix = '';
          const length = 8;
          const arrLen = 16;

          // Act
          const ids = Array.from({ length: arrLen }, () =>
            CloudflareStreamTransformer['getRandomId'](prefix, length),
          );
          const uniqueIds = new Set(ids);
          const uniqueCount = uniqueIds.size;

          // Assert
          expect(uniqueCount).toBe(arrLen);
        });
      });

      describe('convertToolCall', () => {
        const randomId = 'randomId';
        beforeEach(() => {
          vi.spyOn(CloudflareStreamTransformer as any, 'getRandomId').mockReturnValue(randomId);
          vi.spyOn(JSON, 'stringify');
        });

        it('should convert tool call', () => {
          // Arrange
          const toolCall = { name: 'name', arguments: { key: 'value' } };
          const index = 6;

          // Act & Assert
          const converted = CloudflareStreamTransformer['convertToolCall'](toolCall, index);
          expect(converted).toBeInstanceOf(Object);

          const keys = Object.keys(converted);
          expect(keys.length).toBe(4);

          expect(keys).toContain('function');
          expect(converted['function']).toBeInstanceOf(Object);

          const functionKeys = Object.keys(converted['function']);
          expect(functionKeys.length).toBe(2);
          expect(functionKeys).toContain('arguments');
          expect(functionKeys).toContain('name');

          const _functionArguments = converted['function']['arguments'];
          expect(JSON.stringify).toHaveBeenCalledWith(toolCall.arguments);
          expect(typeof _functionArguments).toBe('string');

          const functionArguments = JSON.parse(_functionArguments);
          expect(functionArguments).toEqual(toolCall.arguments);

          expect(converted['function']['name']).toBe(toolCall.name);

          expect(keys).toContain('id');
          expect(CloudflareStreamTransformer['getRandomId']).toHaveBeenCalledWith('call_', 24);
          expect(converted['id']).toBe(randomId);

          expect(keys).toContain('index');
          expect(converted['index']).toBe(index);

          expect(keys).toContain('type');
          expect(converted['type']).toBe('function');
        });
      });

      describe('enqueueToolCalls', () => {
        let controller: TransformStreamDefaultController;
        const convertedToolCall = { name: 'convertedToolCall' };

        beforeEach(() => {
          controller = Object.create(TransformStreamDefaultController.prototype);
          vi.spyOn(controller, 'enqueue').mockImplementation((chunk) => {
            chunks.push(chunk);
          });
          vi.spyOn(CloudflareStreamTransformer as any, 'convertToolCall').mockReturnValue(
            convertedToolCall,
          );
        });

        it('should enqueue tool calls', async () => {
          // Arrange
          const toolCalls = [
            { name: 'name1', arguments: { key1: 'value1', key2: 'value2' } },
            { name: 'name2', arguments: { key: 'value' } },
          ];
          const expected = `data: ${JSON.stringify([convertedToolCall, convertedToolCall])}\n\n`;

          // Act
          await CloudflareStreamTransformer['enqueueToolCalls'](toolCalls, controller);

          // Assert
          expect(chunks.length).toBe(2);
          expect(chunks[0]).toBe('event: tool_calls\n');
          expect(chunks[1]).toBe(expected);
        });
      });
    });
  });

  describe('modelConfig', () => {
    describe('fillUrl', () => {
      it('should return URL with account id', () => {
        const url = fillUrl('80009000a000b000c000d000e000f000');
        expect(url).toBe(
          'https://api.cloudflare.com/client/v4/accounts/80009000a000b000c000d000e000f000/ai/run/',
        );
      });
    });

    describe('maskAccountId', () => {
      describe('desensitizeAccountId', () => {
        it('should replace account id with **** in official API endpoint', () => {
          const url =
            'https://api.cloudflare.com/client/v4/accounts/80009000a000b000c000d000e000f000/ai/run/';
          const maskedUrl = desensitizeCloudflareUrl(url);
          expect(maskedUrl).toBe('https://api.cloudflare.com/client/v4/accounts/****/ai/run/');
        });

        it('should replace account id with **** in custom API endpoint', () => {
          const url =
            'https://api.cloudflare.com/custom/prefix/80009000a000b000c000d000e000f000/custom/suffix/';
          const maskedUrl = desensitizeCloudflareUrl(url);
          expect(maskedUrl).toBe('https://api.cloudflare.com/custom/prefix/****/custom/suffix/');
        });
      });

      describe('desensitizeCloudflareUrl', () => {
        it('should mask account id in official API endpoint', () => {
          const url =
            'https://api.cloudflare.com/client/v4/accounts/80009000a000b000c000d000e000f000/ai/run/';
          const maskedUrl = desensitizeCloudflareUrl(url);
          expect(maskedUrl).toBe('https://api.cloudflare.com/client/v4/accounts/****/ai/run/');
        });

        it('should call desensitizeUrl for custom API endpoint', () => {
          const url = 'https://custom.url/path';
          vi.spyOn(desensitizeTool, 'desensitizeUrl').mockImplementation(
            (_) => 'https://custom.mocked.url',
          );
          const maskedUrl = desensitizeCloudflareUrl(url);
          expect(desensitizeTool.desensitizeUrl).toHaveBeenCalledWith('https://custom.url');
          expect(maskedUrl).toBe('https://custom.mocked.url/path');
        });

        it('should mask account id in custom API endpoint', () => {
          const url =
            'https://custom.url/custom/prefix/80009000a000b000c000d000e000f000/custom/suffix/';
          const maskedUrl = desensitizeCloudflareUrl(url);
          expect(maskedUrl).toBe('https://cu****om.url/custom/prefix/****/custom/suffix/');
        });

        it('should mask account id in custom API endpoint with query params', () => {
          const url =
            'https://custom.url/custom/prefix/80009000a000b000c000d000e000f000/custom/suffix/?query=param';
          const maskedUrl = desensitizeCloudflareUrl(url);
          expect(maskedUrl).toBe(
            'https://cu****om.url/custom/prefix/****/custom/suffix/?query=param',
          );
        });

        it('should mask account id in custom API endpoint with port', () => {
          const url =
            'https://custom.url:8080/custom/prefix/80009000a000b000c000d000e000f000/custom/suffix/';
          const maskedUrl = desensitizeCloudflareUrl(url);
          expect(maskedUrl).toBe('https://cu****om.url:****/custom/prefix/****/custom/suffix/');
        });
      });
    });

    describe('modelManifest', () => {
      describe('getModelBeta', () => {
        it('should get beta property', () => {
          const model = { properties: [{ property_id: 'beta', value: 'true' }] };
          const beta = getModelBeta(model);
          expect(beta).toBe(true);
        });

        it('should return false if beta property is false', () => {
          const model = { properties: [{ property_id: 'beta', value: 'false' }] };
          const beta = getModelBeta(model);
          expect(beta).toBe(false);
        });

        it('should return false if beta property is not present', () => {
          const model = { properties: [] };
          const beta = getModelBeta(model);
          expect(beta).toBe(false);
        });
      });

      describe('getModelDisplayName', () => {
        it('should return display name with beta suffix', () => {
          const model = { name: 'model', properties: [{ property_id: 'beta', value: 'true' }] };
          const name = getModelDisplayName(model, true);
          expect(name).toBe('model (Beta)');
        });

        it('should return display name without beta suffix', () => {
          const model = { name: 'model', properties: [] };
          const name = getModelDisplayName(model, false);
          expect(name).toBe('model');
        });

        it('should return model["name"]', () => {
          const model = { id: 'modelID', name: 'modelName' };
          const name = getModelDisplayName(model, false);
          expect(name).toBe('modelName');
        });

        it('should return last part of model["name"]', () => {
          const model = { name: '@provider/modelFamily/modelName' };
          const name = getModelDisplayName(model, false);
          expect(name).toBe('modelName');
        });
      });

      describe('getModelFunctionCalling', () => {
        it('should return true if function_calling property is true', () => {
          const model = { properties: [{ property_id: 'function_calling', value: 'true' }] };
          const functionCalling = getModelFunctionCalling(model);
          expect(functionCalling).toBe(true);
        });

        it('should return false if function_calling property is false', () => {
          const model = { properties: [{ property_id: 'function_calling', value: 'false' }] };
          const functionCalling = getModelFunctionCalling(model);
          expect(functionCalling).toBe(false);
        });

        it('should return false if function_calling property is not set', () => {
          const model = { properties: [] };
          const functionCalling = getModelFunctionCalling(model);
          expect(functionCalling).toBe(false);
        });

        it('should return false if exception occurs', () => {
          const model = {};
          const functionCalling = getModelFunctionCalling(model);
          expect(functionCalling).toBe(false);
        });
      });

      describe('getModelTokens', () => {
        it('should return tokens property value', () => {
          const model = { properties: [{ property_id: 'max_total_tokens', value: '100' }] };
          const tokens = getModelTokens(model);
          expect(tokens).toBe(100);
        });

        it('should return undefined if tokens property is not present', () => {
          const model = { properties: [] };
          const tokens = getModelTokens(model);
          expect(tokens).toBeUndefined();
        });
      });
    });
  });

  describe('bodyModification', () => {
    describe('removePluginInfo', () => {
      it('should return messages as is if no plugin info', () => {
        // Arrange
        const messages: OpenAIChatMessage[] = [
          { content: 'content1', role: 'system' },
          { content: 'content2', role: 'user' },
        ];

        // Act
        const result = removePluginInfo(messages);

        // Assert
        expect(result).toEqual(messages);
      });

      it('should remove plugin info', () => {
        // Arrange
        const system: OpenAIChatMessage = {
          content: `<plugins_info>
plugin info
</plugins_info>`,
          role: 'system',
        };
        const user: OpenAIChatMessage = { content: 'content', role: 'user' };
        const messages: OpenAIChatMessage[] = [system, user];

        // Act
        const result = removePluginInfo(messages);

        // Assert
        expect(result).toEqual([user]);
      });

      it('should remove plugin info and keep other system messages', () => {
        // Arrange
        const system: OpenAIChatMessage = {
          content: `system
<plugins_info>
plugin info
</plugins_info>`,
          role: 'system',
        };
        const user: OpenAIChatMessage = { content: 'content', role: 'user' };
        const messages: OpenAIChatMessage[] = [system, user];

        // Act
        const result = removePluginInfo(messages);

        // Assert
        expect(result).toEqual([{ content: 'system\n', role: 'system' }, user]);
      });
    });

    describe('modifyTools', () => {
      const _tools: ChatCompletionTool[] = [
        {
          function: {
            description: 'Search Google and return top 10 results',
            name: 'web_search____searchGoogle',
            parameters: {
              properties: {
                _requestBody: {
                  type: 'object',
                  required: ['query'],
                  properties: {
                    query: {
                      type: 'string',
                      example: 'nice places to visit',
                    },
                  },
                },
              },
              type: 'object',
            },
          },
          type: 'function',
        },
        {
          function: {
            description: '提取网页内容',
            name: 'website-crawler____getWebsiteContent',
            parameters: {
              properties: {
                url: {
                  description: '网页链接',
                  type: 'string',
                },
              },
              required: ['url'],
              type: 'object',
            },
          },
          type: 'function',
        },
      ];

      const _toolsExpected: CloudflareAITool[] = [
        {
          function: {
            description: 'Search Google and return top 10 results',
            name: 'web_search____searchGoogle',
            parameters: {
              properties: {
                _requestBody: {
                  type: 'object',
                  description: `Request body in JSON format. Properties (OpenAPI schema):
{
  "required": [
    "query"
  ],
  "properties": {
    "query": {
      "type": "string",
      "example": "nice places to visit"
    }
  }
}`,
                },
              },
              required: ['_requestBody'],
              type: 'object',
            },
          },
          type: 'function',
        },
        {
          function: {
            description: '提取网页内容',
            name: 'website-crawler____getWebsiteContent',
            parameters: {
              properties: {
                url: {
                  description: '网页链接',
                  type: 'string',
                },
              },
              required: ['url'],
              type: 'object',
            },
          },
          type: 'function',
        },
      ];

      it('should return undefined if tools is undefined', () => {
        // Arrange
        const tools = undefined;

        // Act
        const result = modifyTools(tools);

        // Assert
        expect(result).toBeUndefined();
      });

      it('should return empty array if tools is empty', () => {
        // Arrange
        const tools: ChatCompletionTool[] = [];

        // Act
        const result = modifyTools(tools);

        // Assert
        expect(result).toEqual([]);
      });

      it('should simplify complex tools', () => {
        // Arrange
        const tools = [_tools[0]];

        // Act
        const result = modifyTools(tools);

        // Assert
        expect(result).toEqual([_toolsExpected[0]]);
      });

      it('should keep simple tools', () => {
        // Arrange
        const tools = [_tools[1]];

        // Act
        const result = modifyTools(tools);

        // Assert
        expect(result).toEqual([_toolsExpected[1]]);
      });

      it('should handle mixed tools', () => {
        // Arrange
        const tools = _tools;

        // Act
        const result = modifyTools(tools);

        // Assert
        expect(result).toEqual(_toolsExpected);
      });
    });
  });
});
