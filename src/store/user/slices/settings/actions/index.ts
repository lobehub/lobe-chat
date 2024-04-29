import type { StateCreator } from 'zustand/vanilla';

import type { UserStore } from '@/store/user';

import { GeneralSettingsAction, generalSettingsSlice } from './general';
import { LLMSettingsAction, llmSettingsSlice } from './llm';

export interface SettingsAction extends LLMSettingsAction, GeneralSettingsAction {}

export const createSettingsSlice: StateCreator<
  UserStore,
  [['zustand/devtools', never]],
  [],
  SettingsAction
> = (...params) => ({
  ...llmSettingsSlice(...params),
  ...generalSettingsSlice(...params),
});
