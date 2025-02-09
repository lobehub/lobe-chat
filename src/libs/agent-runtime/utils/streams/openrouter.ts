import OpenAI from 'openai';
import type { Stream } from 'openai/streaming';

import { ChatStreamCallbacks } from '../../types';
import {
  StreamProtocolChunk,
  convertIterableToStream,
  createCallbacksTransformer,
  createSSEProtocolTransformer,
} from './protocol';

/**
 * Create a closure to track whether we’ve inserted `<think>` and/or closed it.
 */
function createOpenRouterReasoningTransformer() {
  let reasoningStarted = false;
  let contentStarted = false;
  let insertedThink = false;

  return function transformOpenRouterChunk(chunk: OpenAI.ChatCompletionChunk): StreamProtocolChunk {
    const item = chunk.choices?.[0];
    if (!item) {
      return { data: chunk, id: chunk.id, type: 'data' };
    }

    // 1) If we have a finish_reason, treat it as stop.
    if (item.finish_reason) {
      return { data: item.finish_reason, id: chunk.id, type: 'stop' };
    }

    // 2) Then handle any delta
    const { content, reasoning } = (item.delta as { content?: string; reasoning?: string }) || {};

    const isContentNonEmpty = typeof content === 'string' && content.length > 0;
    const isReasoningNonEmpty = typeof reasoning === 'string' && reasoning.length > 0;

    // 3) Reasoning logic
    if (!contentStarted && isReasoningNonEmpty) {
      if (!reasoningStarted) reasoningStarted = true;
      if (!insertedThink) {
        insertedThink = true;
        return { data: `<think>${reasoning}`, id: chunk.id, type: 'text' };
      }
      return { data: reasoning, id: chunk.id, type: 'text' };
    }

    // 4) Content logic
    if (isContentNonEmpty) {
      if (!contentStarted) {
        contentStarted = true;
        if (reasoningStarted && insertedThink) {
          return { data: `</think>${content}`, id: chunk.id, type: 'text' };
        }
      }
      return { data: content, id: chunk.id, type: 'text' };
    }

    // 5) Fallback
    return { data: chunk, id: chunk.id, type: 'data' };
  };
}

/**
 * The main stream entry point for OpenRouter, similar to Qwen’s “QwenAIStream.”
 */
export function OpenRouterReasoningStream(
  stream: Stream<OpenAI.ChatCompletionChunk> | ReadableStream,
  callbacks?: ChatStreamCallbacks,
) {
  // Convert the stream if it’s an AsyncIterable
  const readableStream =
    stream instanceof ReadableStream ? stream : convertIterableToStream(stream);

  // Create our chunk-by-chunk transformer
  const transformFn = createOpenRouterReasoningTransformer();

  // 1. Transform each chunk to a standard SSE protocol event
  // 2. Pipe it through the user’s callback hooks
  return readableStream
    .pipeThrough(createSSEProtocolTransformer(transformFn))
    .pipeThrough(createCallbacksTransformer(callbacks));
}
