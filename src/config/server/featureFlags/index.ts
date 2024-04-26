import { FEATURE_FLAGS } from '@/const/featureFlags';

export const serverFeatureFlags = () => {
  return { enableWebrtc: FEATURE_FLAGS.webrtcSync, showLLM: FEATURE_FLAGS.languageModel };
};
