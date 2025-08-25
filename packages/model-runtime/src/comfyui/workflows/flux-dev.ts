import { PromptBuilder } from '@saintno/comfyui-sdk';

import { generateUniqueSeeds } from '@/utils/number';

import { getOptimalComponent } from '../config/systemComponents';
import { FLUX_MODEL_CONFIG, WORKFLOW_DEFAULTS } from '../constants';
import { splitPromptForDualCLIP } from '../utils/promptSplitter';
import { selectOptimalWeightDtype } from '../utils/weightDType';

/**
 * FLUX Dev 工作流构建器 / FLUX Dev Workflow Builder
 *
 * @description 构建20步高质量生成工作流，使用FluxGuidance和SamplerCustomAdvanced
 * Builds 20-step high-quality generation workflow with FluxGuidance and SamplerCustomAdvanced
 *
 * @param {string} modelName - 模型文件名 / Model filename
 * @param {Record<string, any>} params - 生成参数 / Generation parameters
 * @returns {PromptBuilder<any, any, any>} 构建的工作流 / Built workflow
 */
export function buildFluxDevWorkflow(
  modelName: string,
  params: Record<string, any>,
): PromptBuilder<any, any, any> {
  // 获取最优组件
  const selectedT5Model = getOptimalComponent('t5');
  const selectedVAE = getOptimalComponent('vae');
  const selectedCLIP = getOptimalComponent('clip');

  const workflow = {
    '1': {
      _meta: {
        title: 'DualCLIP Loader',
      },
      class_type: 'DualCLIPLoader',
      inputs: {
        clip_name1: selectedT5Model,
        clip_name2: selectedCLIP,
        type: 'flux',
      },
    },
    '10': {
      _meta: {
        title: 'Sampler Custom Advanced',
      },
      class_type: 'SamplerCustomAdvanced',
      inputs: {
        guider: ['14', 0], // ✅ BasicGuider provides GUIDER type (handles model/conditioning)
        latent_image: ['7', 0], // Empty latent image for txt2img
        noise: ['13', 0], // Random noise for initialization
        sampler: ['8', 0], // Sampling algorithm (euler)
        sigmas: ['9', 0], // Noise schedule from BasicScheduler
      },
    },
    '11': {
      _meta: {
        title: 'VAE Decode',
      },
      class_type: 'VAEDecode',
      inputs: {
        samples: ['10', 0],
        vae: ['3', 0],
      },
    },
    '12': {
      _meta: {
        title: 'Save Image',
      },
      class_type: 'SaveImage',
      inputs: {
        filename_prefix: FLUX_MODEL_CONFIG.FILENAME_PREFIXES.DEV,
        images: ['11', 0],
      },
    },
    '13': {
      _meta: {
        title: 'Random Noise',
      },
      class_type: 'RandomNoise',
      inputs: {
        noise_seed: WORKFLOW_DEFAULTS.NOISE.SEED,
      },
    },
    '14': {
      _meta: {
        title: 'Basic Guider',
      },
      class_type: 'BasicGuider',
      inputs: {
        conditioning: ['6', 0], // FluxGuidance conditioning output
        model: ['4', 0], // ModelSamplingFlux model
      },
    },
    '2': {
      _meta: {
        title: 'UNET Loader',
      },
      class_type: 'UNETLoader',
      inputs: {
        unet_name: modelName,
        weight_dtype: selectOptimalWeightDtype(modelName),
      },
    },
    '3': {
      _meta: {
        title: 'VAE Loader',
      },
      class_type: 'VAELoader',
      inputs: {
        vae_name: selectedVAE,
      },
    },
    '4': {
      _meta: {
        title: 'Model Sampling Flux',
      },
      class_type: 'ModelSamplingFlux',
      inputs: {
        base_shift: 0.5, // Required parameter for FLUX models
        height: WORKFLOW_DEFAULTS.IMAGE.HEIGHT,
        max_shift: WORKFLOW_DEFAULTS.SAMPLING.MAX_SHIFT,
        model: ['2', 0],
        width: WORKFLOW_DEFAULTS.IMAGE.WIDTH,
      },
    },
    '5': {
      _meta: {
        title: 'CLIP Text Encode (Flux)',
      },
      class_type: 'CLIPTextEncodeFlux',
      inputs: {
        clip: ['1', 0],
        clip_l: '',
        guidance: WORKFLOW_DEFAULTS.SAMPLING.CFG,
        t5xxl: '',
      },
    },
    '6': {
      _meta: {
        title: 'Flux Guidance',
      },
      class_type: 'FluxGuidance',
      inputs: {
        // FluxGuidance需要conditioning输入，接收CLIPTextEncodeFlux输出
        conditioning: ['5', 0],
        guidance: WORKFLOW_DEFAULTS.SAMPLING.CFG,
      },
    },
    '7': {
      _meta: {
        title: 'Empty SD3 Latent Image',
      },
      class_type: 'EmptySD3LatentImage',
      inputs: {
        batch_size: WORKFLOW_DEFAULTS.IMAGE.BATCH_SIZE,
        height: WORKFLOW_DEFAULTS.IMAGE.HEIGHT,
        width: WORKFLOW_DEFAULTS.IMAGE.WIDTH,
      },
    },
    '8': {
      _meta: {
        title: 'K Sampler Select',
      },
      class_type: 'KSamplerSelect',
      inputs: {
        sampler_name: WORKFLOW_DEFAULTS.SAMPLING.SAMPLER,
      },
    },
    '9': {
      _meta: {
        title: 'Basic Scheduler',
      },
      class_type: 'BasicScheduler',
      inputs: {
        denoise: WORKFLOW_DEFAULTS.SAMPLING.DENOISE,
        model: ['4', 0],
        scheduler: WORKFLOW_DEFAULTS.SAMPLING.SCHEDULER,
        steps: WORKFLOW_DEFAULTS.SAMPLING.STEPS,
      },
    },
  };

  // 处理prompt分离 - 在工作流构建早期进行
  const { t5xxlPrompt, clipLPrompt } = splitPromptForDualCLIP(params.prompt ?? '');

  // 直接设置prompt值到工作流节点，而不依赖PromptBuilder的输入映射
  workflow['5'].inputs.clip_l = clipLPrompt;
  workflow['5'].inputs.t5xxl = t5xxlPrompt;

  // Apply input values to workflow
  const width = params.width ?? WORKFLOW_DEFAULTS.IMAGE.WIDTH;
  const height = params.height ?? WORKFLOW_DEFAULTS.IMAGE.HEIGHT;
  const cfg = params.cfg ?? WORKFLOW_DEFAULTS.SAMPLING.CFG;
  const steps = params.steps ?? WORKFLOW_DEFAULTS.SAMPLING.STEPS;
  const seed = params.seed ?? generateUniqueSeeds(1)[0];

  // Set shared values directly to avoid conflicts
  workflow['4'].inputs.width = width; // ModelSamplingFlux needs width/height
  workflow['4'].inputs.height = height;
  workflow['5'].inputs.guidance = cfg; // CLIPTextEncodeFlux needs guidance
  workflow['7'].inputs.width = width; // EmptySD3LatentImage needs width/height
  workflow['7'].inputs.height = height;
  workflow['6'].inputs.guidance = cfg; // FluxGuidance needs guidance
  workflow['9'].inputs.steps = steps; // BasicScheduler needs steps
  workflow['13'].inputs.noise_seed = seed; // RandomNoise needs seed

  // 创建 PromptBuilder - 移除prompt相关的输入参数，因为已直接设置
  const builder = new PromptBuilder(
    workflow,
    ['width', 'height', 'steps', 'cfg', 'seed'], // 移除 'prompt_clip_l', 'prompt_t5xxl'
    ['images'],
  );

  // 设置输出节点
  builder.setOutputNode('images', '12');

  // 保留其他参数的输入映射（不包括prompt相关）
  builder.setInputNode('seed', '13.inputs.noise_seed');
  builder.setInputNode('width', '7.inputs.width');
  builder.setInputNode('height', '7.inputs.height');
  builder.setInputNode('steps', '9.inputs.steps');
  builder.setInputNode('cfg', '6.inputs.guidance');

  // 设置输入值（不包括prompt，已直接设置到工作流）
  builder
    .input('width', width)
    .input('height', height)
    .input('steps', steps)
    .input('cfg', cfg)
    .input('seed', seed);

  return builder;
}
