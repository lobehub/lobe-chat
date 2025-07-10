import { type ModelParamsDefinition } from '@/libs/standard-parameters/meta-schema';

export const fluxKontextDevParamsDefinition: ModelParamsDefinition = {
  prompt: { default: '' },
  imageUrl: { default: null },
  steps: { default: 28, max: 50, min: 10 },
  seed: { default: null },
};
