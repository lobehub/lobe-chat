import { ModelParamsSchema } from '@/libs/standard-parameters';
import { AIImageModelCard } from '@/types/aiModel';

export const fluxSchnellParamsSchema: ModelParamsSchema = {
  height: { default: 1024, max: 1536, min: 512, step: 1 },
  prompt: { default: '' },
  seed: { default: null },
  steps: { default: 4, max: 12, min: 1 },
  width: { default: 1024, max: 1536, min: 512, step: 1 },
};

const falImageModels: AIImageModelCard[] = [
  {
    description: 'Frontier image editing model.',
    displayName: 'FLUX.1 Kontext Dev',
    enabled: true,
    id: 'flux-kontext/dev',
    parameters: {
      imageUrl: { default: null },
      prompt: { default: '' },
      seed: { default: null },
      steps: { default: 28, max: 50, min: 10 },
    },
    releasedAt: '2025-06-28',
    type: 'image',
  },
  {
    description:
      'FLUX.1 Kontext [pro] 能够处理文本和参考图像作为输入，无缝实现目标性的局部编辑和复杂的整体场景变换。',
    displayName: 'FLUX.1 Kontext [pro]',
    enabled: true,
    id: 'flux-pro/kontext',
    parameters: {
      aspectRatio: {
        default: '1:1',
        enum: ['21:9', '16:9', '4:3', '3:2', '1:1', '2:3', '3:4', '9:16', '9:21'],
      },
      imageUrl: { default: null },
      prompt: { default: '' },
      seed: { default: null },
    },
    releasedAt: '2025-05-01',
    type: 'image',
  },
  {
    description:
      'FLUX.1 [schnell] 是一个拥有120亿参数的流式转换器模型，能够在1到4步内从文本生成高质量图像，适合个人和商业用途。',
    displayName: 'FLUX.1 Schnell',
    enabled: true,
    id: 'flux/schnell',
    parameters: fluxSchnellParamsSchema,
    releasedAt: '2024-08-01',
    type: 'image',
  },
  {
    description: 'Google 最高质量的图像生成模型',
    displayName: 'Imagen 4',
    enabled: true,
    id: 'imagen4/preview',
    organization: 'Deepmind',
    parameters: {
      aspectRatio: {
        default: '1:1',
        enum: ['1:1', '16:9', '9:16', '3:4', '4:3'],
      },
      prompt: { default: '' },
      seed: { default: null },
    },
    releasedAt: '2025-05-21',
    type: 'image',
  },
];

export const allModels = [...falImageModels];

export default allModels;
