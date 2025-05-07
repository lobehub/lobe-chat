import { describe, expect, it, vi } from 'vitest';

import * as uuidModule from '@/utils/uuid';

import { VertexAIStream } from './vertex-ai';

describe('VertexAIStream', () => {
  it('should transform Vertex AI stream to protocol stream', async () => {
    vi.spyOn(uuidModule, 'nanoid').mockReturnValueOnce('1');
    const rawChunks = [
      {
        candidates: [
          {
            content: { role: 'model', parts: [{ text: '你好' }] },
            safetyRatings: [
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                probability: 'NEGLIGIBLE',
                probabilityScore: 0.06298828,
                severity: 'HARM_SEVERY_NEGLIGIBLE',
                severityScore: 0.10986328,
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                probability: 'NEGLIGIBLE',
                probabilityScore: 0.05029297,
                severity: 'HARM_SEVERITY_NEGLIGIBLE',
                severityScore: 0.078125,
              },
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                probability: 'NEGLIGIBLE',
                probabilityScore: 0.19433594,
                severity: 'HARM_SEVERITY_NEGLIGIBLE',
                severityScore: 0.16015625,
              },
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                probability: 'NEGLIGIBLE',
                probabilityScore: 0.059326172,
                severity: 'HARM_SEVERITY_NEGLIGIBLE',
                severityScore: 0.064453125,
              },
            ],
            index: 0,
          },
        ],
        usageMetadata: {},
        modelVersion: 'gemini-1.5-flash-001',
      },
      {
        candidates: [
          {
            content: { role: 'model', parts: [{ text: '！ 😊' }] },
            safetyRatings: [
              {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                probability: 'NEGLIGIBLE',
                probabilityScore: 0.052734375,
                severity: 'HARM_SEVRITY_NEGLIGIBLE',
                severityScore: 0.08642578,
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                probability: 'NEGLIGIBLE',
                probabilityScore: 0.071777344,
                severity: 'HARM_SEVERITY_NEGLIGIBLE',
                severityScore: 0.095214844,
              },
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                probability: 'NEGLIGIBLE',
                probabilityScore: 0.1640625,
                severity: 'HARM_SEVERITY_NEGLIGIBLE',
                severityScore: 0.10498047,
              },
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                probability: 'NEGLIGIBLE',
                probabilityScore: 0.075683594,
                severity: 'HARM_SEVERITY_NEGLIGIBLE',
                severityScore: 0.053466797,
              },
            ],
            index: 0,
          },
        ],
        modelVersion: 'gemini-1.5-flash-001',
      },
    ];

    const mockGoogleStream = new ReadableStream({
      start(controller) {
        rawChunks.forEach((chunk) => controller.enqueue(chunk));

        controller.close();
      },
    });

    const onStartMock = vi.fn();
    const onTextMock = vi.fn();
    const onToolCallMock = vi.fn();
    const onCompletionMock = vi.fn();

    const protocolStream = VertexAIStream(mockGoogleStream, {
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
      `data: "你好"\n\n`,

      // text
      'id: chat_1\n',
      'event: text\n',
      `data: "！ 😊"\n\n`,
    ]);

    expect(onStartMock).toHaveBeenCalledTimes(1);
    expect(onTextMock).toHaveBeenCalledTimes(2);
    expect(onCompletionMock).toHaveBeenCalledTimes(1);
  });

  it('tool_calls', async () => {
    vi.spyOn(uuidModule, 'nanoid').mockReturnValueOnce('1');
    const rawChunks = [
      {
        candidates: [
          {
            content: {
              role: 'model',
              parts: [
                {
                  functionCall: {
                    name: 'realtime-weather____fetchCurrentWeather',
                    args: { city: '杭州' },
                  },
                },
              ],
            },
            finishReason: 'STOP',
            safetyRatings: [
              {
                category: 'HARM_CATERY_HATE_SPEECH',
                probability: 'NEGLIGIBLE',
                probabilityScore: 0.09814453,
                severity: 'HARM_SEVERITY_NEGLIGIBLE',
                severityScore: 0.07470703,
              },
              {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                probability: 'NEGLIGIBLE',
                probabilityScore: 0.1484375,
                severity: 'HARM_SEVERITY_NEGLIGIBLE',
                severityScore: 0.15136719,
              },
              {
                category: 'HARM_CATEGORY_HARASSMENT',
                probability: 'NEGLIGIBLE',
                probabilityScore: 0.11279297,
                severity: 'HARM_SEVERITY_NEGLIGIBLE',
                severityScore: 0.10107422,
              },
              {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                probability: 'NEGLIGIBLE',
                probabilityScore: 0.048828125,
                severity: 'HARM_SEVERITY_NEGLIGIBLE',
                severityScore: 0.05493164,
              },
            ],
            index: 0,
          },
        ],
        usageMetadata: { promptTokenCount: 95, candidatesTokenCount: 9, totalTokenCount: 104 },
        modelVersion: 'gemini-1.5-flash-001',
      },
    ];

    const mockGoogleStream = new ReadableStream({
      start(controller) {
        rawChunks.forEach((chunk) => controller.enqueue(chunk));

        controller.close();
      },
    });

    const onStartMock = vi.fn();
    const onTextMock = vi.fn();
    const onToolCallMock = vi.fn();
    const onCompletionMock = vi.fn();

    const protocolStream = VertexAIStream(mockGoogleStream, {
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
      'event: tool_calls\n',
      `data: [{"function":{"arguments":"{\\"city\\":\\"杭州\\"}","name":"realtime-weather____fetchCurrentWeather"},"id":"realtime-weather____fetchCurrentWeather_0","index":0,"type":"function"}]\n\n`,
    ]);

    expect(onStartMock).toHaveBeenCalledTimes(1);
    expect(onToolCallMock).toHaveBeenCalledTimes(1);
    expect(onCompletionMock).toHaveBeenCalledTimes(1);
  });
});
