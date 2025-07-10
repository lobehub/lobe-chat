import { type ModelParamsDefinition } from '@/libs/standard-parameters/meta-schema';

export const gptImage1ParamsDefinition: ModelParamsDefinition = {
  prompt: { default: '' },
  imageUrls: { default: [] },
  size: { 
    default: 'auto',
    enum: ['auto', '1024x1024', '1536x1024', '1024x1536'],
  },
};