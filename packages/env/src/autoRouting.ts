import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

// Compose forwards an unset `${VAR:-}` as `''`; blank means not configured.
const blankToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;
const optionalString = z.preprocess(blankToUndefined, z.string().optional());

/**
 * Auto model routing (Lite / Pro / Ultra). `ENABLE_AUTO_MODEL_ROUTING=1` turns
 * the virtual tiers on; the judge model is optional and only sharpens the
 * per-turn difficulty estimate — without it the rule-based fallback is used.
 */
export const getAutoRoutingConfig = () => {
  return createEnv({
    runtimeEnv: {
      AUTO_ROUTING_JUDGE_API_KEY: process.env.AUTO_ROUTING_JUDGE_API_KEY,
      AUTO_ROUTING_JUDGE_BASE_URL: process.env.AUTO_ROUTING_JUDGE_BASE_URL,
      AUTO_ROUTING_JUDGE_MODEL: process.env.AUTO_ROUTING_JUDGE_MODEL,
      AUTO_ROUTING_JUDGE_PROTOCOL: process.env.AUTO_ROUTING_JUDGE_PROTOCOL,
      AUTO_ROUTING_JUDGE_PROVIDER: process.env.AUTO_ROUTING_JUDGE_PROVIDER,
      AUTO_ROUTING_JUDGE_TIMEOUT_MS: process.env.AUTO_ROUTING_JUDGE_TIMEOUT_MS,
      ENABLE_AUTO_MODEL_ROUTING: process.env.ENABLE_AUTO_MODEL_ROUTING === '1',
    },

    server: {
      /** Key for a custom judge endpoint; ignored when `AUTO_ROUTING_JUDGE_PROVIDER` is set. */
      AUTO_ROUTING_JUDGE_API_KEY: optionalString,
      /** Custom judge endpoint, e.g. `https://aihubmix.com/v1`. */
      AUTO_ROUTING_JUDGE_BASE_URL: z.preprocess(blankToUndefined, z.string().url().optional()),
      AUTO_ROUTING_JUDGE_MODEL: optionalString,
      /**
       * `systemone`: a structured-decision model served at `{baseURL}/systemone`
       * (e.g. Jev). `chat`: any chat model with JSON-schema structured output.
       */
      AUTO_ROUTING_JUDGE_PROTOCOL: z.preprocess(
        blankToUndefined,
        z.enum(['chat', 'systemone']).default('systemone'),
      ),
      /** Reuse a provider already configured on this server instead of a custom endpoint. */
      AUTO_ROUTING_JUDGE_PROVIDER: optionalString,
      AUTO_ROUTING_JUDGE_TIMEOUT_MS: z.preprocess(
        blankToUndefined,
        z.coerce.number().int().positive().default(800),
      ),
      ENABLE_AUTO_MODEL_ROUTING: z.boolean().optional(),
    },
  });
};

export const autoRoutingEnv = getAutoRoutingConfig();
