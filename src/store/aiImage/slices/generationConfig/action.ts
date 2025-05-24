import { StateCreator } from 'zustand/vanilla';

import type { AiImageStore } from '../../store';

export interface GenerationConfigAction {}

export const createGenerationConfigSlice: StateCreator<
  AiImageStore,
  [['zustand/devtools', never]],
  [],
  GenerationConfigAction
> = (set, get) => ({});
