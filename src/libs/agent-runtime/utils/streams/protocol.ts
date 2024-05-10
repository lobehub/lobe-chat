export interface StreamStack {
  id: string;
}

export interface StreamProtocolChunk {
  data: any;
  id?: string;
  type: 'text' | 'tool_calls' | 'data' | 'stop';
}

export interface StreamToolCallChunkData {
  function?: {
    arguments?: string;
    name?: string | null;
  };
  id: string;
  index: number;
  type: 'function' | string;
}

export interface StreamProtocolToolCallChunk {
  data: StreamToolCallChunkData[];
  id: string;
  index: number;
  type: 'tool_calls';
}

export const generateToolCallId = (index: number, functionName?: string) =>
  `${functionName || 'unknown_tool_call'}_${index}`;

export const chatStreamable = async function* <T>(stream: AsyncIterable<T>) {
  for await (const response of stream) {
    yield response;
  }
};
