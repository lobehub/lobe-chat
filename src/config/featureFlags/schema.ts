/* eslint-disable sort-keys-fix/sort-keys-fix */
import { z } from 'zod';

export const FeatureFlagsSchema = z.object({
  /**
   * Enable WebRTC sync
   */
  webrtc_sync: z.boolean().optional(),
  check_updates: z.boolean().optional(),
  pin_list: z.boolean().optional(),

  // settings
  language_model_settings: z.boolean().optional(),

  openai_api_key: z.boolean().optional(),
  openai_proxy_url: z.boolean().optional(),

  create_session: z.boolean().optional(),
  edit_agent: z.boolean().optional(),

  plugins: z.boolean().optional(),
  dalle: z.boolean().optional(),
  speech_to_text: z.boolean().optional(),
  token_counter: z.boolean().optional(),

  welcome_suggest: z.boolean().optional(),

  clerk_sign_up: z.boolean().optional(),

  market: z.boolean().optional(),
  knowledge_base: z.boolean().optional(),

  rag_eval: z.boolean().optional(),

  // internal flag
  cloud_promotion: z.boolean().optional(),

  // the flags below can only be used with commercial license
  // if you want to use it in the commercial usage
  // please contact us for more information: hello@lobehub.com
  commercial_hide_github: z.boolean().optional(),
  commercial_hide_docs: z.boolean().optional(),
});

export type IFeatureFlags = z.infer<typeof FeatureFlagsSchema>;

export const DEFAULT_FEATURE_FLAGS: IFeatureFlags = {
  webrtc_sync: false,
  pin_list: false,

  language_model_settings: true,

  openai_api_key: true,
  openai_proxy_url: true,

  create_session: true,
  edit_agent: true,

  plugins: true,
  dalle: true,

  check_updates: true,
  welcome_suggest: true,
  token_counter: true,

  knowledge_base: true,
  rag_eval: false,

  clerk_sign_up: true,

  cloud_promotion: false,

  market: true,
  speech_to_text: true,

  // the flags below can only be used with commercial license
  // if you want to use it in the commercial usage
  // please contact us for more information: hello@lobehub.com
  commercial_hide_github: false,
  commercial_hide_docs: false,
};

export const mapFeatureFlagsEnvToState = (config: IFeatureFlags) => {
  return {
    enableWebrtc: config.webrtc_sync,
    isAgentEditable: config.edit_agent,

    showCreateSession: config.create_session,
    showLLM: config.language_model_settings,
    showPinList: config.pin_list,

    showOpenAIApiKey: config.openai_api_key,
    showOpenAIProxyUrl: config.openai_proxy_url,

    enablePlugins: config.plugins,
    showDalle: config.dalle,

    enableCheckUpdates: config.check_updates,
    showWelcomeSuggest: config.welcome_suggest,

    enableClerkSignUp: config.clerk_sign_up,

    enableKnowledgeBase: config.knowledge_base,
    enableRAGEval: config.rag_eval,

    showCloudPromotion: config.cloud_promotion,

    showMarket: config.market,
    enableSTT: config.speech_to_text,

    hideGitHub: config.commercial_hide_github,
    hideDocs: config.commercial_hide_docs,
  };
};
