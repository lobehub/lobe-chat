import { AIImageModelCard } from '@/types/aiModel';

import FluxSchnellParamsSchema from '../paramsSchemas/fal/flux-schnell.json';

const googleChatModels: AIImageModelCard[] = [
  {
    description:
      'FLUX.1 [schnell] 是一个拥有120亿参数的流式转换器模型，能够在1到4步内从文本生成高质量图像，适合个人和商业用途。',
    displayName: 'FLUX.1 [schnell]',
    enabled: true,
    id: 'flux/schnell',
    parameters: FluxSchnellParamsSchema,
    releasedAt: '2024-08-01',
    type: 'image',
  },
];

export const allModels = [...googleChatModels];

export default allModels;
