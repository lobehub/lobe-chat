import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const getDecisionConfig = () => {
  return createEnv({
    server: {
      /**
       * Backend that answers Quick Note decision questions.
       * - `tool_choice` (default): the user's `quickNoteDecision` system agent model,
       *   called with a forced function call.
       * - `openrouter`: OpenRouter's Decisions API, authenticated with `OPENROUTER_API_KEY`.
       *   Falls back to `tool_choice` when the key or model is missing.
       */
      QUICK_NOTE_DECISION_BACKEND: z.enum(['tool_choice', 'openrouter']).optional(),
      /** OpenRouter Decisions model id, e.g. `typesafe/jev-1.13`. Required for `openrouter`. */
      QUICK_NOTE_DECISION_OPENROUTER_MODEL: z.string().optional(),
    },
    runtimeEnv: {
      QUICK_NOTE_DECISION_BACKEND: process.env.QUICK_NOTE_DECISION_BACKEND || undefined,
      QUICK_NOTE_DECISION_OPENROUTER_MODEL:
        process.env.QUICK_NOTE_DECISION_OPENROUTER_MODEL || undefined,
    },
  });
};
