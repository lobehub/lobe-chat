import { ChatStreamCallbacks } from '@/libs/agent-runtime';
import { nanoid } from '@/utils/uuid';

import { ChatResp } from '../../wenxin/type';
import {
  StreamProtocolChunk,
  StreamStack,
  createCallbacksTransformer,
  createSSEProtocolTransformer,
} from './protocol';

const transformERNIEBotStream = (chunk: ChatResp): StreamProtocolChunk => {
  const finished = chunk.is_end;
  if (finished) {
    return { data: chunk.finish_reason || 'stop', id: chunk.id, type: 'stop' };
  }

  if (chunk.result) {
    return { data: chunk.result, id: chunk.id, type: 'text' };
  }

  return {
    data: chunk,
    id: chunk.id,
    type: 'data',
  };
};

export const WenxinStream = (
  rawStream: ReadableStream<ChatResp>,
  callbacks?: ChatStreamCallbacks,
) => {
  const streamStack: StreamStack = { id: 'chat_' + nanoid() };

  return rawStream
    .pipeThrough(createSSEProtocolTransformer(transformERNIEBotStream, streamStack))
    .pipeThrough(createCallbacksTransformer(callbacks));
};
