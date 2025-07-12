import { type ModelParamsSchema } from '@/libs/standard-parameters/meta-schema';

export const fluxSchnellParamsSchema: ModelParamsSchema = {
  prompt: { default: '' },
  width: { default: 1024, max: 1536, min: 512, step: 1 },
  height: { default: 1024, max: 1536, min: 512, step: 1 },
  steps: { default: 4, max: 12, min: 1 },
  seed: { default: null },
};
