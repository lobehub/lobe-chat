import { StateCreator } from 'zustand/vanilla';

import type { AiImageStore } from '../../store';

export interface GenerationTopicAction {}

export const createGenerationTopicSlice: StateCreator<
  AiImageStore,
  [['zustand/devtools', never]],
  [],
  GenerationTopicAction
> = (set, get) => ({});
