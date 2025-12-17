import { CURRENT_ONBOARDING_VERSION } from '@lobechat/const';

import type { UserStore } from '../../store';

const currentStep = (s: UserStore) => s.onboarding?.currentStep ?? 1;

const version = (s: UserStore) => s.onboarding?.version ?? CURRENT_ONBOARDING_VERSION;

const finishedAt = (s: UserStore) => s.onboarding?.finishedAt;

const isFinished = (s: UserStore) => !!s.onboarding?.finishedAt;

const needsOnboarding = (s: UserStore) => {
  const onboarding = s.onboarding;
  // Use onboarding field first, fallback to deprecated isOnboard for backward compatibility
  const hasCompletedOnboarding =
    (onboarding?.finishedAt && onboarding.version >= CURRENT_ONBOARDING_VERSION) || s.isOnboard;
  return !hasCompletedOnboarding;
};

export const onboardingSelectors = {
  currentStep,
  finishedAt,
  isFinished,
  needsOnboarding,
  version,
};
