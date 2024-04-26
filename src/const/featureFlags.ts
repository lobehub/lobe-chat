/* eslint-disable sort-keys-fix/sort-keys-fix */
import { z } from 'zod';

export const FeatureFlagsSchema = z.object({
  webrtc_sync: z.boolean().optional(),

  language_model_settings: z.boolean().optional(),

  openai_api_key: z.boolean().optional(),
  openai_proxy_url: z.boolean().optional(),

  create_session: z.boolean().optional(),
  edit_agent: z.boolean().optional(),
});

// TypeScript 类型，从 Zod schema 生成
export type FeatureFlags = z.infer<typeof FeatureFlagsSchema>;

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  webrtc_sync: false,

  language_model_settings: true,

  openai_api_key: false,
  openai_proxy_url: false,

  create_session: false,
  edit_agent: false,
};
