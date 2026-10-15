import { randomUUID } from 'node:crypto';

import type { ChatStreamPayload } from '@lobechat/model-runtime';
import { isRecord } from '@lobechat/utils/object';

import { parseProtocolStream } from './heterogeneous-direct.stream';

/** Only inference fields cross the relay; the operation owns model and identity. */
export const normalizeChatCompletionsRequest = (
  request: Record<string, unknown>,
  model: string,
): ChatStreamPayload => ({
  messages: request.messages as ChatStreamPayload['messages'],
  model,
  stream: true,
  ...(Array.isArray(request.tools) && { tools: request.tools as ChatStreamPayload['tools'] }),
  ...(request.tool_choice !== undefined && {
    tool_choice: request.tool_choice as ChatStreamPayload['tool_choice'],
  }),
  ...(typeof request.temperature === 'number' && { temperature: request.temperature }),
  ...(typeof request.top_p === 'number' && { top_p: request.top_p }),
  ...(typeof request.max_completion_tokens === 'number' || typeof request.max_tokens === 'number'
    ? {
        max_tokens: (typeof request.max_completion_tokens === 'number'
          ? request.max_completion_tokens
          : request.max_tokens) as number,
      }
    : {}),
  ...(typeof request.reasoning_effort === 'string' && {
    reasoning_effort: request.reasoning_effort as ChatStreamPayload['reasoning_effort'],
  }),
});

/** Translate the runtime protocol, including tool deltas and terminal failures. */
export const encodeChatCompletionsStream = (source: ReadableStream<Uint8Array>, model: string) => {
  const id = `chatcmpl-${randomUUID()}`;
  const created = Math.floor(Date.now() / 1000);
  let failed = false;
  let hasTools = false;
  const toolIdentity = new Map<number, { id?: string; name?: string }>();
  let stopped = false;
  let stopReason: string | undefined;
  let usage: Record<string, unknown> | undefined;
  const chunk = (delta: Record<string, unknown>, finishReason: string | null = null) =>
    `data: ${JSON.stringify({ id, object: 'chat.completion.chunk', created, model, choices: [{ index: 0, delta, finish_reason: finishReason }] })}\n\n`;
  const error = (message: string) =>
    `data: ${JSON.stringify({ error: { message, type: 'api_error' } })}\n\n`;
  return parseProtocolStream(source)
    .pipeThrough(
      new TransformStream({
        start(controller) {
          controller.enqueue(chunk({ role: 'assistant', content: '' }));
        },
        transform(event, controller) {
          if (failed) return;
          const part =
            (event.type === 'content_part' || event.type === 'reasoning_part') &&
            isRecord(event.data) &&
            event.data.partType === 'text'
              ? event.data
              : undefined;
          const content =
            event.type === 'text' || event.type === 'reasoning'
              ? typeof event.data === 'string'
                ? event.data
                : undefined
              : typeof part?.content === 'string'
                ? part.content
                : undefined;
          if (content !== undefined) {
            controller.enqueue(
              chunk(
                event.type === 'reasoning' || event.type === 'reasoning_part'
                  ? { reasoning_content: content }
                  : { content },
              ),
            );
          } else if (event.type === 'tool_calls' && Array.isArray(event.data)) {
            const deltas = event.data.flatMap((call) => {
              if (!isRecord(call) || typeof call.index !== 'number') return [];
              const fn = isRecord(call.function) ? call.function : {};
              const identity = toolIdentity.get(call.index) ?? {};
              const id = !identity.id && typeof call.id === 'string' ? call.id : undefined;
              const name = !identity.name && typeof fn.name === 'string' ? fn.name : undefined;
              toolIdentity.set(call.index, { id: identity.id ?? id, name: identity.name ?? name });
              // Runtime adapters may repeat identities. Chat clients concatenate deltas.
              return [
                {
                  index: call.index,
                  ...(id && { id, type: 'function' }),
                  function: {
                    ...(name && { name }),
                    ...(typeof fn.arguments === 'string' && { arguments: fn.arguments }),
                  },
                },
              ];
            });
            hasTools ||= deltas.length > 0;
            if (deltas.length > 0) controller.enqueue(chunk({ tool_calls: deltas }));
          } else if (event.type === 'usage' && isRecord(event.data)) {
            const input = Number(event.data.totalInputTokens) || 0;
            const output = Number(event.data.totalOutputTokens) || 0;
            usage = {
              prompt_tokens: input,
              completion_tokens: output,
              total_tokens: input + output,
              prompt_tokens_details: { cached_tokens: Number(event.data.inputCachedTokens) || 0 },
              completion_tokens_details: {
                reasoning_tokens: Number(event.data.outputReasoningTokens) || 0,
              },
            };
          } else if (event.type === 'stop') {
            stopped = true;
            // Providers report raw reasons, e.g. Gemini emits `MAX_TOKENS`.
            if (!stopReason && typeof event.data === 'string' && event.data !== 'message_stop')
              stopReason = event.data.toLowerCase();
          } else if (event.type === 'error') {
            failed = true;
            controller.enqueue(
              error(
                isRecord(event.data)
                  ? String(event.data.message || 'Model request failed')
                  : String(event.data),
              ),
            );
          }
        },
        flush(controller) {
          if (!failed) {
            if (!stopped) {
              controller.enqueue(error('Upstream stream ended before completion'));
            } else {
              const finishReason = ['length', 'max_tokens'].includes(stopReason ?? '')
                ? 'length'
                : ['content_filter', 'refusal'].includes(stopReason ?? '')
                  ? 'content_filter'
                  : hasTools
                    ? 'tool_calls'
                    : 'stop';
              controller.enqueue(chunk({}, finishReason));
              if (usage)
                controller.enqueue(
                  `data: ${JSON.stringify({ id, object: 'chat.completion.chunk', created, model, choices: [], usage })}\n\n`,
                );
            }
          }
          controller.enqueue('data: [DONE]\n\n');
        },
      }),
    )
    .pipeThrough(new TextEncoderStream());
};
