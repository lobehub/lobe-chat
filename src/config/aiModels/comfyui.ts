import { ModelParamsSchema } from '@/libs/standard-parameters';
import { AIImageModelCard } from '@/types/aiModel';

/**
 * FLUX 模型支持的宽高比
 * 支持从 21:9 到 9:21 的宽范围比例，包含折叠屏设备
 */
const FLUX_ASPECT_RATIOS = [
  '21:9', // 超宽屏
  '16:9', // 宽屏
  '8:7', // 折叠屏 (如 Galaxy Z Fold, 展开状态约 7.6寸)
  '4:3', // 传统横屏
  '3:2', // 经典横屏
  '1:1', // 正方形
  '2:3', // 经典竖屏
  '3:4', // 传统竖屏
  '7:8', // 折叠屏竖向
  '9:16', // 竖屏
  '9:21', // 超高竖屏
];

/**
 * FLUX.1 Schnell 模型参数配置
 * 超快速文生图模式，1-4 步即可生成，Apache 2.0 许可证
 */
export const fluxSchnellParamsSchema: ModelParamsSchema = {
  aspectRatio: {
    default: '1:1',
    enum: FLUX_ASPECT_RATIOS,
  },
  height: { default: 1024, max: 1536, min: 512, step: 8 },
  prompt: { default: '' },
  seed: { default: null },
  steps: { default: 4, max: 4, min: 1, step: 1 },
  width: { default: 1024, max: 1536, min: 512, step: 8 },
};

/**
 * FLUX.1 Dev 模型参数配置
 * 高质量文生图模式，支持 guidance scale 调节，非商业许可证
 */
export const fluxDevParamsSchema: ModelParamsSchema = {
  aspectRatio: {
    default: '1:1',
    enum: FLUX_ASPECT_RATIOS,
  },
  cfg: { default: 3.5, max: 10, min: 1, step: 0.5 },
  height: { default: 1024, max: 2048, min: 512, step: 8 },
  prompt: { default: '' },
  seed: { default: null },
  steps: { default: 20, max: 50, min: 10, step: 1 },
  width: { default: 1024, max: 2048, min: 512, step: 8 },
};

/**
 * FLUX.1 Krea-dev 模型参数配置
 * 增强安全的文生图模式，与 Krea 合作开发，非商业许可证
 */
export const fluxKreaDevParamsSchema: ModelParamsSchema = {
  aspectRatio: {
    default: '1:1',
    enum: FLUX_ASPECT_RATIOS,
  },
  cfg: { default: 4.5, max: 10, min: 1, step: 0.5 },
  height: { default: 1024, max: 2048, min: 512, step: 8 },
  prompt: { default: '' },
  seed: { default: null },
  steps: { default: 20, max: 50, min: 10, step: 1 },
  width: { default: 1024, max: 2048, min: 512, step: 8 },
};

/**
 * FLUX.1 Kontext-dev 模型参数配置
 * 图像编辑模式，支持基于文本指令修改现有图像，非商业许可证
 */
export const fluxKontextDevParamsSchema: ModelParamsSchema = {
  aspectRatio: {
    default: '1:1',
    enum: FLUX_ASPECT_RATIOS,
  },
  cfg: { default: 3.5, max: 10, min: 1, step: 0.5 },
  height: { default: 1024, max: 2048, min: 512, step: 8 },
  imageUrl: { default: '' }, // 输入图像 URL（支持文生图和图生图）
  prompt: { default: '' },
  seed: { default: null },
  steps: { default: 28, max: 50, min: 10, step: 1 }, // Kontext 默认使用 28 步
  strength: { default: 0.75, max: 1, min: 0, step: 0.05 }, // 图像编辑强度控制（对应 denoise）
  width: { default: 1024, max: 2048, min: 512, step: 8 },
};

/**
 * ComfyUI 支持的图像生成模型列表
 * 第一阶段支持完整的 FLUX 系列模型
 */
const comfyuiImageModels: AIImageModelCard[] = [
  {
    description:
      'FLUX.1 Schnell 是超快速文生图模型，1-4步即可生成高质量图像，适合实时应用。Apache 2.0 开源许可。',
    displayName: 'FLUX.1 Schnell',
    enabled: true,
    id: 'flux-schnell',
    parameters: fluxSchnellParamsSchema,
    releasedAt: '2024-08-01',
    type: 'image',
  },
  {
    description:
      'FLUX.1 Dev 是高质量文生图模型，支持 guidance scale 调节，适合生成高质量作品。非商业许可。',
    displayName: 'FLUX.1 Dev',
    enabled: true,
    id: 'flux-dev',
    parameters: fluxDevParamsSchema,
    releasedAt: '2024-08-01',
    type: 'image',
  },
  {
    description:
      'FLUX.1 Krea-dev 是增强安全的文生图模型，与 Krea 合作开发，内置安全过滤。非商业许可。',
    displayName: 'FLUX.1 Krea-dev',
    enabled: true,
    id: 'flux-krea-dev',
    parameters: fluxKreaDevParamsSchema,
    releasedAt: '2025-07-31',
    type: 'image',
  },
  {
    description: 'FLUX.1 Kontext-dev 是图像编辑模型，支持基于文本指令修改现有图像。非商业许可。',
    displayName: 'FLUX.1 Kontext-dev',
    enabled: true,
    id: 'flux-kontext-dev',
    parameters: fluxKontextDevParamsSchema,
    releasedAt: '2025-05-29', // 与 BFL 官方的 Kontext 系列发布时间对齐
    type: 'image',
  },
];

export const allModels = [...comfyuiImageModels];

export default allModels;
