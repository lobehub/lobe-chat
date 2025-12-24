import { AIImageModelCard } from '../types';

// Replicate image models
// https://replicate.com/black-forest-labs
const imageModels: AIImageModelCard[] = [
  {
    description: 'FLUX 1.1 Pro - 更快更优的 FLUX Pro 版本，具有出色的图像质量和提示词遵循能力。',
    displayName: 'FLUX 1.1 Pro',
    enabled: true,
    id: 'black-forest-labs/flux-1.1-pro',
    parameters: {
      aspectRatio: {
        default: '1:1',
        enum: ['1:1', '16:9', '9:16', '4:3', '3:4', '21:9', '9:21'],
      },
      prompt: { default: '' },
      seed: { default: null },
    },
    pricing: {
      units: [{ name: 'imageGeneration', rate: 0.04, strategy: 'fixed', unit: 'image' }],
    },
    releasedAt: '2024-10-02',
    type: 'image',
  },
  {
    description: 'FLUX Schnell - 专为速度优化的快速图像生成模型。',
    displayName: 'FLUX Schnell',
    enabled: true,
    id: 'black-forest-labs/flux-schnell',
    parameters: {
      aspectRatio: {
        default: '1:1',
        enum: ['1:1', '16:9', '9:16', '4:3', '3:4', '21:9', '9:21'],
      },
      prompt: { default: '' },
      seed: { default: null },
    },
    pricing: {
      units: [{ name: 'imageGeneration', rate: 0.003, strategy: 'fixed', unit: 'image' }],
    },
    releasedAt: '2024-08-01',
    type: 'image',
  },
  {
    description: 'FLUX Dev - FLUX 开发版本，仅供非商业用途使用。',
    displayName: 'FLUX Dev',
    enabled: true,
    id: 'black-forest-labs/flux-dev',
    parameters: {
      aspectRatio: {
        default: '1:1',
        enum: ['1:1', '16:9', '9:16', '4:3', '3:4', '21:9', '9:21'],
      },
      cfg: { default: 3.5, max: 10, min: 1, step: 0.1 },
      prompt: { default: '' },
      seed: { default: null },
      steps: { default: 28, max: 50, min: 1 },
    },
    pricing: {
      units: [{ name: 'imageGeneration', rate: 0.025, strategy: 'fixed', unit: 'image' }],
    },
    releasedAt: '2024-08-01',
    type: 'image',
  },
  {
    description: 'FLUX Pro - 专业版 FLUX 模型，输出高质量图像。',
    displayName: 'FLUX Pro',
    enabled: true,
    id: 'black-forest-labs/flux-pro',
    parameters: {
      aspectRatio: {
        default: '1:1',
        enum: ['1:1', '16:9', '9:16', '4:3', '3:4', '21:9', '9:21'],
      },
      cfg: { default: 3, max: 10, min: 1, step: 0.1 },
      prompt: { default: '' },
      seed: { default: null },
      steps: { default: 25, max: 50, min: 1 },
    },
    pricing: {
      units: [{ name: 'imageGeneration', rate: 0.05, strategy: 'fixed', unit: 'image' }],
    },
    releasedAt: '2024-08-01',
    type: 'image',
  },
];

export const allModels = [...imageModels];

export default allModels;
