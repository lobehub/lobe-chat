import { CURRENT_ONBOARDING_VERSION } from '@lobechat/const';

import type { UserStore } from '../../store';

/**
 * Returns the current step for UI display.
 * Prioritizes local optimistic state over server state for immediate feedback.
 */
const currentStep = (s: UserStore) => s.localOnboardingStep ?? s.onboarding?.currentStep ?? 1;

const version = (s: UserStore) => s.onboarding?.version ?? CURRENT_ONBOARDING_VERSION;

const finishedAt = (s: UserStore) => s.onboarding?.finishedAt;

const isFinished = (s: UserStore) => !!s.onboarding?.finishedAt;

const needsOnboarding = (s: UserStore) => {
  const onboarding = s.onboarding;
  const hasCompletedOnboarding =
    onboarding?.finishedAt && onboarding.version >= CURRENT_ONBOARDING_VERSION;
  return !hasCompletedOnboarding;
};

export const onboardingSelectors = {
  currentStep,
  finishedAt,
  isFinished,
  needsOnboarding,
  version,
};
