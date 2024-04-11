import type { StateCreator } from 'zustand/vanilla';

import type { GlobalStore } from '@/store/global';

import { GeneralSettingsAction, generalSettingsSlice } from './general';
import { LLMSettingsAction, llmSettingsSlice } from './llm';

export interface SettingsAction extends LLMSettingsAction, GeneralSettingsAction {}

export const createSettingsSlice: StateCreator<
  GlobalStore,
  [['zustand/devtools', never]],
  [],
  SettingsAction
> = (...params) => ({
  ...llmSettingsSlice(...params),
  ...generalSettingsSlice(...params),
});
