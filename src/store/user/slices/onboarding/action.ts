import { CURRENT_ONBOARDING_VERSION, INBOX_SESSION_ID } from '@lobechat/const';
import type { StateCreator } from 'zustand/vanilla';

import { userService } from '@/services/user';
import { getAgentStoreState } from '@/store/agent';
import type { UserStore } from '@/store/user';

import { settingsSelectors } from '../settings/selectors';
import { onboardingSelectors } from './selectors';

export interface OnboardingAction {
  finishOnboarding: () => Promise<void>;
  goToNextStep: () => Promise<void>;
  goToPreviousStep: () => Promise<void>;
  setOnboardingStep: (step: number) => Promise<void>;
  /**
   * Toggle plugin in default agent config for onboarding
   */
  toggleDefaultPlugin: (id: string, open?: boolean) => Promise<void>;
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

  toggleDefaultPlugin: async (id, open) => {
    const currentSettings = settingsSelectors.currentSettings(get());
    const currentPlugins = currentSettings.defaultAgent?.config?.plugins || [];

    const index = currentPlugins.indexOf(id);
    const shouldOpen = open !== undefined ? open : index === -1;

    let newPlugins: string[];
    if (shouldOpen) {
      newPlugins = index === -1 ? [...currentPlugins, id] : currentPlugins;
    } else {
      newPlugins = index !== -1 ? currentPlugins.filter((p) => p !== id) : currentPlugins;
    }

    const agentStore = getAgentStoreState();
    const inboxAgentId = agentStore.builtinAgentIdMap[INBOX_SESSION_ID];

    // Calculate inbox agent's new plugins
    const inboxPlugins = inboxAgentId ? agentStore.agentMap[inboxAgentId]?.plugins || [] : [];
    const inboxIndex = inboxPlugins.indexOf(id);
    let newInboxPlugins: string[];
    if (shouldOpen) {
      newInboxPlugins = inboxIndex === -1 ? [...inboxPlugins, id] : inboxPlugins;
    } else {
      newInboxPlugins = inboxIndex !== -1 ? inboxPlugins.filter((p) => p !== id) : inboxPlugins;
    }

    await Promise.all([
      // 1. Update user settings' defaultAgentConfig
      get().updateDefaultAgent({ config: { plugins: newPlugins } }),
      // 2. Update inbox agent's plugins
      inboxAgentId && agentStore.updateAgentConfigById(inboxAgentId, { plugins: newInboxPlugins }),
    ]);
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
