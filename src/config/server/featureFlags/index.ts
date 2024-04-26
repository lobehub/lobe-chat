import { FEATURE_FLAGS } from '@/const/featureFlags';

export const serverFeatureFlags = () => {
  return {
    enableWebrtc: FEATURE_FLAGS.webrtcSync,
    isAgentEditable: FEATURE_FLAGS.isAgentEditable,
    showLLM: FEATURE_FLAGS.languageModel,
  };
};
