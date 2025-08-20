import { ModelParamsSchema } from '@/libs/standard-parameters';
import { AIImageModelCard } from '@/types/aiModel';

export const fluxSchnellParamsSchema: ModelParamsSchema = {
  height: { default: 1024, max: 1536, min: 512, step: 1 },
  prompt: { default: '' },
  seed: { default: null },
  steps: { default: 4, max: 12, min: 1, step: 1 },
  width: { default: 1024, max: 1536, min: 512, step: 1 },
};

export const fluxKreaParamsSchema: ModelParamsSchema = {
  cfg: { default: 7.5, max: 20, min: 0, step: 0.1 },
  height: { default: 1248, max: 2048, min: 512, step: 1 },
  prompt: { default: '' },
  seed: { default: null },
  steps: { default: 28, max: 50, min: 1, step: 1 },
  width: { default: 832, max: 2048, min: 512, step: 1 },
};

export const qwenImageParamsSchema: ModelParamsSchema = {
  cfg: { default: 2.5, max: 20, min: 0, step: 0.1 },
  // 实测 fal 宽高 最大就支持到 1536
  // 默认值取自 https://chat.qwen.ai/ 官网的默认值
  height: { default: 1328, max: 1536, min: 512, step: 1 },
  prompt: { default: '' },
  seed: { default: null },
  steps: { default: 30, max: 50, min: 2, step: 1 },
  width: { default: 1328, max: 1536, min: 512, step: 1 },
};

export const qwenEditParamsSchema: ModelParamsSchema = {
  cfg: { default: 4, max: 20, min: 0, step: 0.1 },
  height: { default: 1328, max: 1536, min: 512, step: 1 },
  imageUrl: { default: null },
  prompt: { default: '' },
  seed: { default: null },
  steps: { default: 30, max: 50, min: 2, step: 1 },
  width: { default: 1328, max: 1536, min: 512, step: 1 },
};

const falImageModels: AIImageModelCard[] = [
  {
    description: '专注于图像编辑任务的FLUX.1模型，支持文本和图像输入。',
    displayName: 'FLUX.1 Kontext [dev]',
    enabled: true,
    id: 'flux-kontext/dev',
    parameters: {
      imageUrl: { default: null },
      prompt: { default: '' },
      seed: { default: null },
      steps: { default: 28, max: 50, min: 10 },
    },
    pricing: {
      units: [{ name: 'imageGeneration', rate: 0.025, strategy: 'fixed', unit: 'megapixel' }],
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
    pricing: {
      units: [{ name: 'imageGeneration', rate: 0.04, strategy: 'fixed', unit: 'image' }],
    },
    releasedAt: '2025-05-01',
    type: 'image',
  },
  {
    description: 'FLUX.1 [schnell] 是一个具有120亿参数的图像生成模型，专注于快速生成高质量图像。',
    displayName: 'FLUX.1 Schnell',
    enabled: true,
    id: 'flux/schnell',
    parameters: fluxSchnellParamsSchema,
    pricing: {
      units: [{ name: 'imageGeneration', rate: 0.003, strategy: 'fixed', unit: 'megapixel' }],
    },
    releasedAt: '2024-08-01',
    type: 'image',
  },
  {
    description: 'Flux Krea [dev] 是一个有美学偏好的图像生成模型，目标是生成更加真实、自然的图像。',
    displayName: 'FLUX.1 Krea [dev]',
    enabled: true,
    id: 'flux/krea',
    parameters: fluxKreaParamsSchema,
    pricing: {
      units: [{ name: 'imageGeneration', rate: 0.025, strategy: 'fixed', unit: 'megapixel' }],
    },
    releasedAt: '2025-07-31',
    type: 'image',
  },
  {
    description: 'Google 提供的高质量的图像生成模型',
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
    pricing: {
      units: [{ name: 'imageGeneration', rate: 0.05, strategy: 'fixed', unit: 'image' }],
    },
    releasedAt: '2025-05-21',
    type: 'image',
  },
  {
    description:
      'Qwen 团队发布的专业图像编辑模型，支持语义编辑和外观编辑，能够精确编辑中英文文字，实现风格转换、对象旋转等高质量图像编辑。',
    displayName: 'Qwen Edit',
    enabled: true,
    id: 'qwen-image-edit',
    parameters: qwenEditParamsSchema,
    pricing: {
      units: [{ name: 'imageGeneration', rate: 0.025, strategy: 'fixed', unit: 'image' }],
    },
    releasedAt: '2025-08-19',
    type: 'image',
  },
  {
    description:
      'Qwen 团队带来的强大生图模型，具有令人印象深刻的中文文字生成能力和多样图片视觉风格。',
    displayName: 'Qwen Image',
    enabled: true,
    id: 'qwen-image',
    parameters: qwenImageParamsSchema,
    pricing: {
      units: [{ name: 'imageGeneration', rate: 0.02, strategy: 'fixed', unit: 'megapixel' }],
    },
    releasedAt: '2025-08-04',
    type: 'image',
  },
];

export const allModels = [...falImageModels];

export default allModels;
