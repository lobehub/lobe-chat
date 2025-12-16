import { CURRENT_ONBOARDING_VERSION, INBOX_SESSION_ID } from '@lobechat/const';
import type { StateCreator } from 'zustand/vanilla';

import { userService } from '@/services/user';
import { getAgentStoreState } from '@/store/agent';
import type { UserStore } from '@/store/user';

import { onboardingSelectors } from './selectors';

export interface OnboardingAction {
  finishOnboarding: () => Promise<void>;
  goToNextStep: () => Promise<void>;
  goToPreviousStep: () => Promise<void>;
  setOnboardingStep: (step: number) => Promise<void>;
  /**
   * Update default model for both user settings and inbox agent
   */
  updateDefaultModel: (model: string, provider: string) => Promise<void>;
}

export const createOnboardingSlice: StateCreator<
  UserStore,
  [['zustand/devtools', never]],
  [],
  OnboardingAction
> = (_set, get) => ({
  finishOnboarding: async () => {
    const currentStep = onboardingSelectors.currentStep(get());

    await userService.updateOnboarding({
      currentStep,
      finishedAt: new Date().toISOString(),
      version: CURRENT_ONBOARDING_VERSION,
    });

    await get().refreshUserState();
  },

  goToNextStep: async () => {
    const currentStep = onboardingSelectors.currentStep(get());
    const nextStep = currentStep + 1;

    await userService.updateOnboarding({
      currentStep: nextStep,
      version: CURRENT_ONBOARDING_VERSION,
    });

    await get().refreshUserState();
  },

  goToPreviousStep: async () => {
    const currentStep = onboardingSelectors.currentStep(get());
    if (currentStep <= 1) return;

    const prevStep = currentStep - 1;

    await userService.updateOnboarding({
      currentStep: prevStep,
      version: CURRENT_ONBOARDING_VERSION,
    });

    await get().refreshUserState();
  },

  setOnboardingStep: async (step) => {
    await userService.updateOnboarding({
      currentStep: step,
      version: CURRENT_ONBOARDING_VERSION,
    });

    await get().refreshUserState();
  },

  updateDefaultModel: async (model, provider) => {
    const agentStore = getAgentStoreState();
    const inboxAgentId = agentStore.builtinAgentIdMap[INBOX_SESSION_ID];

    await Promise.all([
      // 1. Update user settings' defaultAgentConfig
      get().updateDefaultAgent({ config: { model, provider } }),
      // 2. Update inbox agent's model
      inboxAgentId && agentStore.updateAgentConfigById(inboxAgentId, { model, provider }),
    ]);
  },
});
