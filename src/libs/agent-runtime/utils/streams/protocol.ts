import OpenAI from 'openai';

interface StreamProtocolChunk {
  data: any;
  id: string;
  type: 'text' | 'tool_calls' | 'data' | 'stop';
}

export const transformOpenAIStream = (chunk: Uint8Array): StreamProtocolChunk => {
  const decoder = new TextDecoder();

  const chunkValue = decoder.decode(chunk, { stream: true });
  const jsonValue: OpenAI.ChatCompletionChunk = JSON.parse(chunkValue);

  // maybe need another structure to add support for multiple choices
  const item = jsonValue.choices[0];

  if (typeof item.delta.content === 'string') {
    return { data: item.delta.content, id: jsonValue.id, type: 'text' };
  }

  if (item.delta.tool_calls) {
    return { data: item.delta.tool_calls, id: jsonValue.id, type: 'tool_calls' };
  }

  if (item.delta.content === null) {
    return { data: item.delta, id: jsonValue.id, type: 'data' };
  }

  // 给定结束原因
  if (item.finish_reason) {
    return { data: item.finish_reason, id: jsonValue.id, type: 'stop' };
  }

  // 其余情况下，返回 delta 和 index
  return {
    data: { delta: item.delta, id: jsonValue.id, index: item.index },
    id: jsonValue.id,
    type: 'data',
  };
};
