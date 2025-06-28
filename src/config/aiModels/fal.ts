import { AIImageModelCard } from '@/types/aiModel';

import FluxKontextDevParamsSchema from '../paramsSchemas/fal/flux-kontext-dev.json';
import FluxKontextProParamsSchema from '../paramsSchemas/fal/flux-pro-kontext.json';
import FluxSchnellParamsSchema from '../paramsSchemas/fal/flux-schnell.json';
import Imagen4ParamsSchema from '../paramsSchemas/fal/imagen4.json';

const googleChatModels: AIImageModelCard[] = [
  {
    description: 'Frontier image editing model.',
    displayName: 'FLUX.1 Kontext Dev',
    enabled: true,
    id: 'flux-kontext/dev',
    parameters: FluxKontextDevParamsSchema,
    releasedAt: '2025-06-28',
    type: 'image',
  },
  {
    description:
      'FLUX.1 Kontext [pro] 能够处理文本和参考图像作为输入，无缝实现目标性的局部编辑和复杂的整体场景变换。',
    displayName: 'FLUX.1 Kontext [pro]',
    enabled: true,
    id: 'flux-pro/kontext',
    parameters: FluxKontextProParamsSchema,
    releasedAt: '2025-05-01',
    type: 'image',
  },
  {
    description:
      'FLUX.1 [schnell] 是一个拥有120亿参数的流式转换器模型，能够在1到4步内从文本生成高质量图像，适合个人和商业用途。',
    displayName: 'FLUX.1 Schnell',
    enabled: true,
    id: 'flux/schnell',
    parameters: FluxSchnellParamsSchema,
    releasedAt: '2024-08-01',
    type: 'image',
  },
  {
    description: 'Google 最高质量的图像生成模型',
    displayName: 'Imagen 4',
    enabled: true,
    id: 'imagen4/preview',
    parameters: Imagen4ParamsSchema,
    releasedAt: '2025-05-21',
    type: 'image',
    organization: 'Deepmind',
  },
];

export const allModels = [...googleChatModels];

export default allModels;
