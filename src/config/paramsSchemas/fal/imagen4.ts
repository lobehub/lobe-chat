import { type ModelParamsDefinition } from '@/libs/standard-parameters/meta-schema';

export const imagen4ParamsDefinition: ModelParamsDefinition = {
  prompt: { default: '' },
  aspectRatio: { 
    default: '1:1',
    enum: ['1:1', '16:9', '9:16', '3:4', '4:3'],
  },
  seed: { default: null },
};