import { type ModelParamsSchema } from '@/libs/standard-parameters/meta-schema';

export const fluxSchnellParamsSchema: ModelParamsSchema = {
  height: { default: 1024, max: 1536, min: 512, step: 1 },
  prompt: { default: '' },
  seed: { default: null },
  steps: { default: 4, max: 12, min: 1 },
  width: { default: 1024, max: 1536, min: 512, step: 1 },
};
