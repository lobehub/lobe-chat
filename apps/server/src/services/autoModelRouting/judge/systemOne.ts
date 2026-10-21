import type { AutoRoutingDifficulty } from 'model-bank/autoRouting';
import { z } from 'zod';

import type { JudgeClient } from './types';
import {
  DIFFICULTY_INSTRUCTIONS,
  DIFFICULTY_LEVELS,
  REASONING_INSTRUCTIONS,
  TOPIC_SHIFT_INSTRUCTIONS,
} from './types';

const ResponseSchema = z.object({
  answers: z.object({
    difficulty: z.object({ confidence: z.number().optional(), score: z.number() }),
    needs_reasoning: z.object({ noul: z.number() }).optional(),
    topic_shift: z.object({ noul: z.number() }).optional(),
  }),
});

const clampDifficulty = (score: number): AutoRoutingDifficulty =>
  Math.min(Math.max(Math.round(score), 0), 2) as AutoRoutingDifficulty;

/**
 * "System One" structured-decision protocol (e.g. Jev): `POST {baseURL}/systemone`
 * with typed questions; every question is answered in parallel against the
 * same state and returns a typed value instead of free text.
 */
export const createSystemOneJudge = (config: {
  apiKey?: string;
  baseURL: string;
  model: string;
}): JudgeClient => ({
  judge: async ({ state }, signal) => {
    const response = await fetch(`${config.baseURL.replace(/\/+$/, '')}/systemone`, {
      body: JSON.stringify({
        model: config.model,
        questions: {
          difficulty: {
            criteria: DIFFICULTY_LEVELS,
            instructions: DIFFICULTY_INSTRUCTIONS,
            type: 'score',
          },
          needs_reasoning: { instructions: REASONING_INSTRUCTIONS, type: 'noul' },
          topic_shift: { instructions: TOPIC_SHIFT_INSTRUCTIONS, type: 'noul' },
        },
        state,
      }),
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
      },
      method: 'POST',
      signal,
    });
    if (!response.ok) throw new Error(`System One judge responded ${response.status}`);

    const { answers } = ResponseSchema.parse(await response.json());
    return {
      confidence: answers.difficulty.confidence,
      difficulty: clampDifficulty(answers.difficulty.score),
      needsReasoning: answers.needs_reasoning?.noul,
      source: 'judge',
      topicShift: answers.topic_shift?.noul,
    };
  },
});
