import OpenAI from 'openai';

export interface StreamProtocolChunk {
  data: any;
  id: string;
  type: 'text' | 'tool_calls' | 'data' | 'stop';
}

export interface StreamToolCallChunk {
  function?: {
    arguments?: string;
    name?: string | null;
  };
  id: string;
  index: number;
  type: 'function' | string;
}

export const generateToolCallId = (index: number, functionName?: string) =>
  `${functionName || 'unknown_tool_call'}_${index}`;

export const chatStreamable = async function* <T>(stream: AsyncIterable<T>) {
  for await (const response of stream) {
    yield response;
  }
};
