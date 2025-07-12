import { type ModelParamsSchema } from '@/libs/standard-parameters/meta-schema';

export const fluxProKontextParamsSchema: ModelParamsSchema = {
  prompt: { default: '' },
  imageUrl: { default: null },
  aspectRatio: {
    default: '1:1',
    enum: ['21:9', '16:9', '4:3', '3:2', '1:1', '2:3', '3:4', '9:16', '9:21'],
  },
  seed: { default: null },
};
