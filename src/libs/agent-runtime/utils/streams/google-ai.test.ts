import { EnhancedGenerateContentResponse } from '@google/generative-ai';
import { describe, expect, it, vi } from 'vitest';

import * as uuidModule from '@/utils/uuid';

import { GoogleGenerativeAIStream } from './google-ai';

describe('GoogleGenerativeAIStream', () => {
  it('should transform Google Generative AI stream to protocol stream', async () => {
    vi.spyOn(uuidModule, 'nanoid').mockReturnValueOnce('1');

    const mockGenerateContentResponse = (text: string, functionCalls?: any[]) =>
      ({
        text: () => text,
        functionCall: () => functionCalls?.[0],
        functionCalls: () => functionCalls,
      }) as EnhancedGenerateContentResponse;

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
      onStart: onStartMock,
      onText: onTextMock,
      onToolsCalling: onToolCallMock,
      onCompletion: onCompletionMock,
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
      `data: [{"function":{"arguments":"{\\"arg1\\":\\"value1\\"}","name":"testFunction"},"id":"testFunction_0","index":0,"type":"function"}]\n\n`,

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
    const mockGenerateContentResponse = (text: string, functionCalls?: any[]) =>
      ({
        text: () => text,
        functionCall: () => functionCalls?.[0],
        functionCalls: () => functionCalls,
      }) as EnhancedGenerateContentResponse;

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
      `data: {"inputImageTokens":258,"inputTextTokens":8,"totalInputTokens":266,"totalTokens":266}\n\n`,
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
        text: () => '234',
        usageMetadata: {
          promptTokenCount: 20,
          totalTokenCount: 20,
          promptTokensDetails: [{ modality: 'TEXT', tokenCount: 20 }],
        },
        modelVersion: 'gemini-2.0-flash-exp-image-generation',
      },
      {
        text: () => '567890\n',
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
        `data: {"inputTextTokens":19,"totalInputTokens":19,"totalOutputTokens":11,"totalTokens":30}\n`,
      ].map((i) => i + '\n'),
    );
  });
});
