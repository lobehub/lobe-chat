import { UserOnboarding } from '@/types/user';

export interface OnboardingState {
  onboarding?: UserOnboarding;
}

export const initialOnboardingState: OnboardingState = {
  onboarding: undefined,
};
