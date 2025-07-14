import { type ModelParamsSchema } from '@/libs/standard-parameters/meta-schema';

export const fluxKontextDevParamsSchema: ModelParamsSchema = {
  imageUrl: { default: null },
  prompt: { default: '' },
  seed: { default: null },
  steps: { default: 28, max: 50, min: 10 },
};
