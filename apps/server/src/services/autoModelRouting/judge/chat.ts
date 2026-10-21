import type { AutoRoutingDifficulty } from 'model-bank/autoRouting';
import { z } from 'zod';

import type { JudgeClient } from './types';
import {
  DIFFICULTY_INSTRUCTIONS,
  DIFFICULTY_LEVELS,
  REASONING_INSTRUCTIONS,
  TOPIC_SHIFT_INSTRUCTIONS,
} from './types';

export const JUDGE_JSON_SCHEMA = {
  name: 'auto_model_routing_judge',
  schema: {
    additionalProperties: false,
    properties: {
      difficulty: { enum: [0, 1, 2], type: 'integer' },
      needs_reasoning: { maximum: 1, minimum: 0, type: 'number' },
      topic_shift: { maximum: 1, minimum: 0, type: 'number' },
    },
    required: ['difficulty', 'needs_reasoning', 'topic_shift'],
    type: 'object' as const,
  },
  strict: true,
};

const AnswerSchema = z.object({
  difficulty: z.number(),
  needs_reasoning: z.number().optional(),
  topic_shift: z.number().optional(),
});

export const buildJudgeMessages = (state: string) => [
  {
    content: [
      'You route a chat turn to a model. Read the conversation and answer with JSON only.',
      `difficulty — ${DIFFICULTY_INSTRUCTIONS}`,
      ...DIFFICULTY_LEVELS.map((level, index) => `  ${index}: ${level}`),
      `needs_reasoning — probability 0-1. ${REASONING_INSTRUCTIONS}`,
      `topic_shift — probability 0-1. ${TOPIC_SHIFT_INSTRUCTIONS}`,
    ].join('\n'),
    role: 'system' as const,
  },
  { content: state, role: 'user' as const },
];

export const parseJudgeAnswer = (raw: unknown) => {
  const answer = AnswerSchema.parse(raw);
  return {
    difficulty: Math.min(Math.max(Math.round(answer.difficulty), 0), 2) as AutoRoutingDifficulty,
    needsReasoning: answer.needs_reasoning,
    source: 'judge' as const,
    topicShift: answer.topic_shift,
  };
};

/** Any chat model with JSON-schema output, reached through a generic object generator. */
export const createChatJudge = (
  generateObject: (
    messages: ReturnType<typeof buildJudgeMessages>,
    signal: AbortSignal,
  ) => Promise<unknown>,
): JudgeClient => ({
  judge: async ({ state }, signal) =>
    parseJudgeAnswer(await generateObject(buildJudgeMessages(state), signal)),
});

/** OpenAI-compatible `/chat/completions` endpoint configured by URL and key. */
export const createOpenAICompatibleJudge = (config: {
  apiKey?: string;
  baseURL: string;
  model: string;
}): JudgeClient =>
  createChatJudge(async (messages, signal) => {
    const response = await fetch(`${config.baseURL.replace(/\/+$/, '')}/chat/completions`, {
      body: JSON.stringify({
        messages,
        model: config.model,
        response_format: { json_schema: JUDGE_JSON_SCHEMA, type: 'json_schema' },
        temperature: 0,
      }),
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
      },
      method: 'POST',
      signal,
    });
    if (!response.ok) throw new Error(`Chat judge responded ${response.status}`);
    const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    return JSON.parse(data.choices?.[0]?.message?.content ?? '');
  });
