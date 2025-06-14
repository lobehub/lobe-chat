import { StateCreator } from 'zustand';

import { imageService } from '@/services/image';

import { ImageStore } from '../../store';

// ====== action interface ====== //

export interface CreateImageAction {
  createImage: () => Promise<void>;
}

// ====== action implementation ====== //

export const createCreateImageSlice: StateCreator<
  ImageStore,
  [['zustand/devtools', never]],
  [],
  CreateImageAction
> = (set, get) => ({
  async createImage() {
    set({ isCreating: true }, false, 'createImage/startCreateImage');

    const { activeGenerationTopicId, createGenerationTopic, provider, model, parameters } = get();
    if (!parameters) {
      throw new TypeError('parameters is not initialized');
    }

    if (!parameters.prompt) {
      throw new TypeError('prompt is empty');
    }

    // 1. Create generation topic if not exists
    let generationTopicId = activeGenerationTopicId;
    if (!generationTopicId) {
      const prompts = [parameters.prompt];
      generationTopicId = await createGenerationTopic(prompts);
    }

    // 2. Create image
    await imageService.createImage({
      generationTopicId,
      provider,
      model,
      params: parameters as any,
    });

    set({ isCreating: false }, false, 'createImage/endCreateImage');

    // Refresh generation batches to show the new data
    await get().refreshGenerationBatches();
  },
});
