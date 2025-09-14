import { GenerateContentResponse } from '@google/genai';
import * as uuidModule from '@lobechat/utils';
import { describe, expect, it, vi } from 'vitest';

import { GoogleGenerativeAIStream } from './google-ai';

describe('GoogleGenerativeAIStream', () => {
  it('should transform Google Generative AI stream to protocol stream', async () => {
    vi.spyOn(uuidModule, 'nanoid').mockReturnValueOnce('1').mockReturnValueOnce('abcd1234');

    const mockGenerateContentResponse = (text: string, functionCalls?: any[]) =>
      ({
        text: text,
        functionCalls: functionCalls,
      }) as unknown as GenerateContentResponse;

    const mockGoogleStream = new ReadableStream({
      start(controller) {
        controller.enqueue(mockGenerateContentResponse('Hello'));

        controller.enqueue(
          mockGenerateContentResponse('', [{ name: 'testFunction', args: { arg1: 'value1' } }]),
        );
        controller.enqueue(mockGenerateContentResponse(' world!'));
        controller.close();
      },
    });

    const onStartMock = vi.fn();
    const onTextMock = vi.fn();
    const onToolCallMock = vi.fn();
    const onCompletionMock = vi.fn();

    const protocolStream = GoogleGenerativeAIStream(mockGoogleStream, {
      callbacks: {
        onStart: onStartMock,
        onText: onTextMock,
        onToolsCalling: onToolCallMock,
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
      // text
      'id: chat_1\n',
      'event: text\n',
      `data: "Hello"\n\n`,

      // tool call
      'id: chat_1\n',
      'event: tool_calls\n',
      `data: [{"function":{"arguments":"{\\"arg1\\":\\"value1\\"}","name":"testFunction"},"id":"testFunction_0_abcd1234","index":0,"type":"function"}]\n\n`,

      // text
      'id: chat_1\n',
      'event: text\n',
      `data: " world!"\n\n`,
    ]);

    expect(onStartMock).toHaveBeenCalledTimes(1);
    expect(onTextMock).toHaveBeenNthCalledWith(1, 'Hello');
    expect(onTextMock).toHaveBeenNthCalledWith(2, ' world!');
    expect(onToolCallMock).toHaveBeenCalledTimes(1);
    expect(onCompletionMock).toHaveBeenCalledTimes(1);
  });

  it('should handle empty stream', async () => {
    const mockGoogleStream = new ReadableStream({
      start(controller) {
        controller.close();
      },
    });

    const protocolStream = GoogleGenerativeAIStream(mockGoogleStream);

    const decoder = new TextDecoder();
    const chunks = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    expect(chunks).toEqual([]);
  });

  it('should handle image', async () => {
    vi.spyOn(uuidModule, 'nanoid').mockReturnValueOnce('1');

    const data = {
      candidates: [
        {
          content: {
            parts: [{ inlineData: { mimeType: 'image/png', data: 'iVBORw0KGgoAA' } }],
            role: 'model',
          },
          index: 0,
        },
      ],
      usageMetadata: {
        promptTokenCount: 6,
        totalTokenCount: 6,
        promptTokensDetails: [{ modality: 'TEXT', tokenCount: 6 }],
      },
      modelVersion: 'gemini-2.0-flash-exp',
    };

    const mockGoogleStream = new ReadableStream({
      start(controller) {
        controller.enqueue(data);

        controller.close();
      },
    });

    const protocolStream = GoogleGenerativeAIStream(mockGoogleStream);

    const decoder = new TextDecoder();
    const chunks = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    expect(chunks).toEqual([
      // image
      'id: chat_1\n',
      'event: base64_image\n',
      `data: "data:image/png;base64,iVBORw0KGgoAA"\n\n`,
    ]);
  });

  it('should handle token count', async () => {
    vi.spyOn(uuidModule, 'nanoid').mockReturnValueOnce('1');

    const data = {
      candidates: [{ content: { role: 'model' }, finishReason: 'STOP', index: 0 }],
      usageMetadata: {
        promptTokenCount: 266,
        totalTokenCount: 266,
        promptTokensDetails: [
          { modality: 'TEXT', tokenCount: 8 },
          { modality: 'IMAGE', tokenCount: 258 },
        ],
      },
      modelVersion: 'gemini-2.0-flash-exp',
    };

    const mockGoogleStream = new ReadableStream({
      start(controller) {
        controller.enqueue(data);

        controller.close();
      },
    });

    const protocolStream = GoogleGenerativeAIStream(mockGoogleStream);

    const decoder = new TextDecoder();
    const chunks = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    expect(chunks).toEqual([
      // stop
      'id: chat_1\n',
      'event: stop\n',
      `data: "STOP"\n\n`,
      // usage
      'id: chat_1\n',
      'event: usage\n',
      `data: {"inputImageTokens":258,"inputTextTokens":8,"outputTextTokens":0,"totalInputTokens":266,"totalOutputTokens":0,"totalTokens":266}\n\n`,
    ]);
  });

  it('should handle token count with cached token count', async () => {
    vi.spyOn(uuidModule, 'nanoid').mockReturnValueOnce('1');

    const data = {
      candidates: [{ content: { role: 'model' }, finishReason: 'STOP', index: 0 }],
      usageMetadata: {
        promptTokenCount: 15725,
        candidatesTokenCount: 1053,
        totalTokenCount: 16778,
        cachedContentTokenCount: 14286,
        promptTokensDetails: [{ modality: 'TEXT', tokenCount: 15725 }],
        cacheTokensDetails: [{ modality: 'TEXT', tokenCount: 14286 }],
      },
      modelVersion: 'gemini-2.0-flash-exp',
    };

    const mockGoogleStream = new ReadableStream({
      start(controller) {
        controller.enqueue(data);

        controller.close();
      },
    });

    const protocolStream = GoogleGenerativeAIStream(mockGoogleStream);

    const decoder = new TextDecoder();
    const chunks = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    expect(chunks).toEqual([
      // stop
      'id: chat_1\n',
      'event: stop\n',
      `data: "STOP"\n\n`,
      // usage
      'id: chat_1\n',
      'event: usage\n',
      `data: {"inputCachedTokens":14286,"inputTextTokens":15725,"outputTextTokens":1053,"totalInputTokens":15725,"totalOutputTokens":1053,"totalTokens":16778}\n\n`,
    ]);
  });

  it('should handle stop with content', async () => {
    vi.spyOn(uuidModule, 'nanoid').mockReturnValueOnce('1');

    const data = [
      {
        candidates: [
          {
            content: { parts: [{ text: '234' }], role: 'model' },
            safetyRatings: [
              { category: 'HARM_CATEGORY_HATE_SPEECH', probability: 'NEGLIGIBLE' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', probability: 'NEGLIGIBLE' },
              { category: 'HARM_CATEGORY_HARASSMENT', probability: 'NEGLIGIBLE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', probability: 'NEGLIGIBLE' },
            ],
          },
        ],
        text: '234',
        usageMetadata: {
          promptTokenCount: 20,
          totalTokenCount: 20,
          promptTokensDetails: [{ modality: 'TEXT', tokenCount: 20 }],
        },
        modelVersion: 'gemini-2.0-flash-exp-image-generation',
      },
      {
        text: '567890\n',
        candidates: [
          {
            content: { parts: [{ text: '567890\n' }], role: 'model' },
            finishReason: 'STOP',
            safetyRatings: [
              { category: 'HARM_CATEGORY_HATE_SPEECH', probability: 'NEGLIGIBLE' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', probability: 'NEGLIGIBLE' },
              { category: 'HARM_CATEGORY_HARASSMENT', probability: 'NEGLIGIBLE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', probability: 'NEGLIGIBLE' },
            ],
          },
        ],
        usageMetadata: {
          promptTokenCount: 19,
          candidatesTokenCount: 11,
          totalTokenCount: 30,
          promptTokensDetails: [{ modality: 'TEXT', tokenCount: 19 }],
          candidatesTokensDetails: [{ modality: 'TEXT', tokenCount: 11 }],
        },
        modelVersion: 'gemini-2.0-flash-exp-image-generation',
      },
    ];

    const mockGoogleStream = new ReadableStream({
      start(controller) {
        data.forEach((item) => {
          controller.enqueue(item);
        });

        controller.close();
      },
    });

    const protocolStream = GoogleGenerativeAIStream(mockGoogleStream);

    const decoder = new TextDecoder();
    const chunks = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    expect(chunks).toEqual(
      [
        'id: chat_1',
        'event: text',
        'data: "234"\n',

        'id: chat_1',
        'event: text',
        `data: "567890\\n"\n`,
        // stop
        'id: chat_1',
        'event: stop',
        `data: "STOP"\n`,
        // usage
        'id: chat_1',
        'event: usage',
        `data: {"inputTextTokens":19,"outputTextTokens":11,"totalInputTokens":19,"totalOutputTokens":11,"totalTokens":30}\n`,
      ].map((i) => i + '\n'),
    );
  });

  it('should handle stop with content and thought', async () => {
    vi.spyOn(uuidModule, 'nanoid').mockReturnValueOnce('1');

    const data = [
      {
        candidates: [
          {
            content: { parts: [{ text: '234' }], role: 'model' },
            safetyRatings: [
              { category: 'HARM_CATEGORY_HATE_SPEECH', probability: 'NEGLIGIBLE' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', probability: 'NEGLIGIBLE' },
              { category: 'HARM_CATEGORY_HARASSMENT', probability: 'NEGLIGIBLE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', probability: 'NEGLIGIBLE' },
            ],
          },
        ],
        text: '234',
        usageMetadata: {
          promptTokenCount: 19,
          candidatesTokenCount: 3,
          totalTokenCount: 122,
          promptTokensDetails: [{ modality: 'TEXT', tokenCount: 19 }],
          thoughtsTokenCount: 100,
        },
        modelVersion: 'gemini-2.5-flash-preview-04-17',
      },
      {
        text: '567890\n',
        candidates: [
          {
            content: { parts: [{ text: '567890\n' }], role: 'model' },
            finishReason: 'STOP',
            safetyRatings: [
              { category: 'HARM_CATEGORY_HATE_SPEECH', probability: 'NEGLIGIBLE' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', probability: 'NEGLIGIBLE' },
              { category: 'HARM_CATEGORY_HARASSMENT', probability: 'NEGLIGIBLE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', probability: 'NEGLIGIBLE' },
            ],
          },
        ],
        usageMetadata: {
          promptTokenCount: 19,
          candidatesTokenCount: 11,
          totalTokenCount: 131,
          promptTokensDetails: [{ modality: 'TEXT', tokenCount: 19 }],
          candidatesTokensDetails: [{ modality: 'TEXT', tokenCount: 11 }],
          thoughtsTokenCount: 100,
        },
        modelVersion: 'gemini-2.5-flash-preview-04-17',
      },
    ];

    const mockGoogleStream = new ReadableStream({
      start(controller) {
        data.forEach((item) => {
          controller.enqueue(item);
        });

        controller.close();
      },
    });

    const protocolStream = GoogleGenerativeAIStream(mockGoogleStream);

    const decoder = new TextDecoder();
    const chunks = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    expect(chunks).toEqual(
      [
        'id: chat_1',
        'event: text',
        'data: "234"\n',

        'id: chat_1',
        'event: text',
        `data: "567890\\n"\n`,
        // stop
        'id: chat_1',
        'event: stop',
        `data: "STOP"\n`,
        // usage
        'id: chat_1',
        'event: usage',
        `data: {"inputTextTokens":19,"outputReasoningTokens":100,"outputTextTokens":11,"totalInputTokens":19,"totalOutputTokens":111,"totalTokens":131}\n`,
      ].map((i) => i + '\n'),
    );
  });

  it('should handle thought candidate part', async () => {
    vi.spyOn(uuidModule, 'nanoid').mockReturnValueOnce('1');

    const data = [
      {
        candidates: [
          {
            content: {
              parts: [{ text: '**Understanding the Conditional Logic**\n\n', thought: true }],
              role: 'model',
            },
            index: 0,
          },
        ],
        text: '**Understanding the Conditional Logic**\n\n',
        usageMetadata: {
          promptTokenCount: 38,
          candidatesTokenCount: 7,
          totalTokenCount: 301,
          promptTokensDetails: [{ modality: 'TEXT', tokenCount: 38 }],
          thoughtsTokenCount: 256,
        },
        modelVersion: 'models/gemini-2.5-flash-preview-04-17',
      },
      {
        candidates: [
          {
            content: {
              parts: [{ text: '**Finalizing Interpretation**\n\n', thought: true }],
              role: 'model',
            },
            index: 0,
          },
        ],
        text: '**Finalizing Interpretation**\n\n',
        usageMetadata: {
          promptTokenCount: 38,
          candidatesTokenCount: 13,
          totalTokenCount: 355,
          promptTokensDetails: [{ modality: 'TEXT', tokenCount: 38 }],
          thoughtsTokenCount: 304,
        },
        modelVersion: 'models/gemini-2.5-flash-preview-04-17',
      },
      {
        candidates: [
          {
            content: {
              parts: [{ text: '简单来说，' }],
              role: 'model',
            },
            index: 0,
          },
        ],
        text: '简单来说，',
        usageMetadata: {
          promptTokenCount: 38,
          candidatesTokenCount: 16,
          totalTokenCount: 358,
          promptTokensDetails: [{ modality: 'TEXT', tokenCount: 38 }],
          thoughtsTokenCount: 304,
        },
        modelVersion: 'models/gemini-2.5-flash-preview-04-17',
      },
      {
        candidates: [
          {
            content: { parts: [{ text: '文本内容。' }], role: 'model' },
            finishReason: 'STOP',
            index: 0,
          },
        ],
        text: '文本内容。',
        usageMetadata: {
          promptTokenCount: 38,
          candidatesTokenCount: 19,
          totalTokenCount: 361,
          promptTokensDetails: [{ modality: 'TEXT', tokenCount: 38 }],
          thoughtsTokenCount: 304,
        },
        modelVersion: 'models/gemini-2.5-flash-preview-04-17',
      },
    ];

    const mockGoogleStream = new ReadableStream({
      start(controller) {
        data.forEach((item) => {
          controller.enqueue(item);
        });

        controller.close();
      },
    });

    const protocolStream = GoogleGenerativeAIStream(mockGoogleStream);

    const decoder = new TextDecoder();
    const chunks = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    expect(chunks).toEqual(
      [
        'id: chat_1',
        'event: reasoning',
        'data: "**Understanding the Conditional Logic**\\n\\n"\n',

        'id: chat_1',
        'event: reasoning',
        `data: "**Finalizing Interpretation**\\n\\n"\n`,

        'id: chat_1',
        'event: text',
        `data: "简单来说，"\n`,

        'id: chat_1',
        'event: text',
        `data: "文本内容。"\n`,
        // stop
        'id: chat_1',
        'event: stop',
        `data: "STOP"\n`,
        // usage
        'id: chat_1',
        'event: usage',
        `data: {"inputTextTokens":38,"outputReasoningTokens":304,"outputTextTokens":19,"totalInputTokens":38,"totalOutputTokens":323,"totalTokens":361}\n`,
      ].map((i) => i + '\n'),
    );
  });

  it('should return undefined data without text', async () => {
    vi.spyOn(uuidModule, 'nanoid').mockReturnValueOnce('1');

    const data = [
      {
        candidates: [
          {
            content: { parts: [{ text: '234' }], role: 'model' },
            safetyRatings: [
              { category: 'HARM_CATEGORY_HATE_SPEECH', probability: 'NEGLIGIBLE' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', probability: 'NEGLIGIBLE' },
              { category: 'HARM_CATEGORY_HARASSMENT', probability: 'NEGLIGIBLE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', probability: 'NEGLIGIBLE' },
            ],
          },
        ],
        text: '234',
        usageMetadata: {
          promptTokenCount: 19,
          candidatesTokenCount: 3,
          totalTokenCount: 122,
          promptTokensDetails: [{ modality: 'TEXT', tokenCount: 19 }],
          thoughtsTokenCount: 100,
        },
        modelVersion: 'gemini-2.5-flash-preview-04-17',
      },
      {
        text: '',
        candidates: [
          {
            content: { parts: [{ text: '' }], role: 'model' },
            safetyRatings: [
              { category: 'HARM_CATEGORY_HATE_SPEECH', probability: 'NEGLIGIBLE' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', probability: 'NEGLIGIBLE' },
              { category: 'HARM_CATEGORY_HARASSMENT', probability: 'NEGLIGIBLE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', probability: 'NEGLIGIBLE' },
            ],
          },
        ],
        usageMetadata: {
          promptTokenCount: 19,
          candidatesTokenCount: 3,
          totalTokenCount: 122,
          promptTokensDetails: [{ modality: 'TEXT', tokenCount: 19 }],
          candidatesTokensDetails: [{ modality: 'TEXT', tokenCount: 3 }],
          thoughtsTokenCount: 100,
        },
        modelVersion: 'gemini-2.5-flash-preview-04-17',
      },
      {
        text: '567890\n',
        candidates: [
          {
            content: { parts: [{ text: '567890\n' }], role: 'model' },
            finishReason: 'STOP',
            safetyRatings: [
              { category: 'HARM_CATEGORY_HATE_SPEECH', probability: 'NEGLIGIBLE' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', probability: 'NEGLIGIBLE' },
              { category: 'HARM_CATEGORY_HARASSMENT', probability: 'NEGLIGIBLE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', probability: 'NEGLIGIBLE' },
            ],
          },
        ],
        usageMetadata: {
          promptTokenCount: 19,
          candidatesTokenCount: 11,
          totalTokenCount: 131,
          promptTokensDetails: [{ modality: 'TEXT', tokenCount: 19 }],
          candidatesTokensDetails: [{ modality: 'TEXT', tokenCount: 11 }],
          thoughtsTokenCount: 100,
        },
        modelVersion: 'gemini-2.5-flash-preview-04-17',
      },
    ];

    const mockGoogleStream = new ReadableStream({
      start(controller) {
        data.forEach((item) => {
          controller.enqueue(item);
        });

        controller.close();
      },
    });

    const protocolStream = GoogleGenerativeAIStream(mockGoogleStream);

    const decoder = new TextDecoder();
    const chunks = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    expect(chunks).toEqual(
      [
        'id: chat_1',
        'event: text',
        'data: "234"\n',

        'id: chat_1',
        'event: text',
        'data: ""\n',

        'id: chat_1',
        'event: text',
        `data: "567890\\n"\n`,
        // stop
        'id: chat_1',
        'event: stop',
        `data: "STOP"\n`,
        // usage
        'id: chat_1',
        'event: usage',
        `data: {"inputTextTokens":19,"outputReasoningTokens":100,"outputTextTokens":11,"totalInputTokens":19,"totalOutputTokens":111,"totalTokens":131}\n`,
      ].map((i) => i + '\n'),
    );
  });

  it('should handle groundingMetadata', async () => {
    vi.spyOn(uuidModule, 'nanoid').mockReturnValueOnce('1');

    const data = [
      {
        text: '123',
        candidates: [
          {
            content: {
              parts: [
                {
                  text: '123',
                },
              ],
              role: 'model',
            },
            index: 0,
            groundingMetadata: {},
          },
        ],
        usageMetadata: {
          promptTokenCount: 9,
          candidatesTokenCount: 18,
          totalTokenCount: 27,
          promptTokensDetails: [
            {
              modality: 'TEXT',
              tokenCount: 9,
            },
          ],
        },
        modelVersion: 'models/gemini-2.5-flash-preview-04-17',
      },
      {
        text: '45678',
        candidates: [
          {
            content: {
              parts: [
                {
                  text: '45678',
                },
              ],
              role: 'model',
            },
            finishReason: 'STOP',
            index: 0,
            groundingMetadata: {
              searchEntryPoint: {
                renderedContent: 'content\n',
              },
              groundingChunks: [
                {
                  web: {
                    uri: 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AbF9wXG1234545',
                    title: 'npmjs.com',
                  },
                },
                {
                  web: {
                    uri: 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AbF9wXE9288334',
                    title: 'google.dev',
                  },
                },
              ],
              groundingSupports: [
                {
                  segment: {
                    startIndex: 63,
                    endIndex: 67,
                    text: '1。',
                  },
                  groundingChunkIndices: [0],
                  confidenceScores: [1],
                },
                {
                  segment: {
                    startIndex: 69,
                    endIndex: 187,
                    text: 'SDK。',
                  },
                  groundingChunkIndices: [1],
                  confidenceScores: [1],
                },
              ],
              webSearchQueries: ['sdk latest version'],
            },
          },
        ],
        usageMetadata: {
          promptTokenCount: 9,
          candidatesTokenCount: 122,
          totalTokenCount: 131,
          promptTokensDetails: [
            {
              modality: 'TEXT',
              tokenCount: 9,
            },
          ],
        },
        modelVersion: 'models/gemini-2.5-flash-preview-04-17',
      },
    ];

    const mockGoogleStream = new ReadableStream({
      start(controller) {
        data.forEach((item) => {
          controller.enqueue(item);
        });

        controller.close();
      },
    });

    const protocolStream = GoogleGenerativeAIStream(mockGoogleStream);

    const decoder = new TextDecoder();
    const chunks = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    expect(chunks).toEqual(
      [
        'id: chat_1',
        'event: text',
        'data: "123"\n',

        'id: chat_1',
        'event: text',
        'data: "45678"\n',

        'id: chat_1',
        'event: grounding',
        `data: {\"citations\":[{\"favicon\":\"npmjs.com\",\"title\":\"npmjs.com\",\"url\":\"https://vertexaisearch.cloud.google.com/grounding-api-redirect/AbF9wXG1234545\"},{\"favicon\":\"google.dev\",\"title\":\"google.dev\",\"url\":\"https://vertexaisearch.cloud.google.com/grounding-api-redirect/AbF9wXE9288334\"}],\"searchQueries\":[\"sdk latest version\"]}\n`,
        // stop
        'id: chat_1',
        'event: stop',
        `data: "STOP"\n`,
        // usage
        'id: chat_1',
        'event: usage',
        `data: {"inputTextTokens":9,"outputTextTokens":122,"totalInputTokens":9,"totalOutputTokens":122,"totalTokens":131}\n`,
      ].map((i) => i + '\n'),
    );
  });

  it('should handle promptFeedback with blockReason (PROHIBITED_CONTENT)', async () => {
    vi.spyOn(uuidModule, 'nanoid').mockReturnValueOnce('1');

    const data = {
      promptFeedback: {
        blockReason: 'PROHIBITED_CONTENT',
      },
      usageMetadata: {
        promptTokenCount: 4438,
        totalTokenCount: 4438,
        promptTokensDetails: [{ modality: 'TEXT', tokenCount: 4438 }],
      },
      modelVersion: 'gemini-2.5-pro',
      responseId: 'THOUaKaNOeiGz7IPjL_VgQc',
    };

    const mockGoogleStream = new ReadableStream({
      start(controller) {
        controller.enqueue(data);
        controller.close();
      },
    });

    const protocolStream = GoogleGenerativeAIStream(mockGoogleStream);

    const decoder = new TextDecoder();
    const chunks = [];

    // @ts-ignore
    for await (const chunk of protocolStream) {
      chunks.push(decoder.decode(chunk, { stream: true }));
    }

    expect(chunks).toEqual([
      'id: chat_1\n',
      'event: error\n',
      `data: {"body":{"context":{"promptFeedback":{"blockReason":"PROHIBITED_CONTENT"}},"message":"您的请求可能包含违禁内容。请调整您的请求，确保内容符合使用规范。","provider":"google"},"type":"ProviderBizError"}\n\n`,
    ]);
  });
});
