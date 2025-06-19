import { StateCreator } from 'zustand';

import { imageService } from '@/services/image';

import { ImageStore } from '../../store';
import { generationBatchSelectors } from '../generationBatch/selectors';
import { imageGenerationConfigSelectors } from '../generationConfig/selectors';
import { generationTopicSelectors } from '../generationTopic';

// ====== action interface ====== //

export interface CreateImageAction {
  createImage: () => Promise<void>;
  /**
   * eg: invalid api key, recreate image
   */
  recreateImage: (generationBatchId: string) => Promise<void>;
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

    const store = get();
    const imageNum = imageGenerationConfigSelectors.imageNum(store);
    const parameters = imageGenerationConfigSelectors.parameters(store);
    const provider = imageGenerationConfigSelectors.provider(store);
    const model = imageGenerationConfigSelectors.model(store);
    const activeGenerationTopicId = generationTopicSelectors.activeGenerationTopicId(store);
    const { createGenerationTopic } = store;

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
      imageNum,
      params: parameters as any,
    });

    set({ isCreating: false }, false, 'createImage/endCreateImage');

    // Refresh generation batches to show the new data
    await get().refreshGenerationBatches();
  },

  async recreateImage(generationBatchId: string) {
    set({ isCreating: true }, false, 'recreateImage/startCreateImage');

    const store = get();
    const imageNum = imageGenerationConfigSelectors.imageNum(store);
    const activeGenerationTopicId = generationTopicSelectors.activeGenerationTopicId(store);
    const batch = generationBatchSelectors.getGenerationBatchByBatchId(generationBatchId)(store)!;
    const { removeGenerationBatch } = store;

    // 1. Delete generation batch
    await removeGenerationBatch(generationBatchId, activeGenerationTopicId!);

    // 2. Create image
    await imageService.createImage({
      generationTopicId: activeGenerationTopicId!,
      provider: batch.provider,
      model: batch.model,
      imageNum,
      params: batch.config as any,
    });

    set({ isCreating: false }, false, 'recreateImage/endCreateImage');

    // 3. Refresh generation batches to show the new data
    await store.refreshGenerationBatches();
  },
});
