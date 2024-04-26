import { FEATURE_FLAGS } from '@/const/featureFlags';

export const serverFeatureFlags = () => {
  return { enableWebrtc: FEATURE_FLAGS.webrtcSync, hideLLM: !FEATURE_FLAGS.languageModel };
};
