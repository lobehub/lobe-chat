import { PromptBuilder } from '@saintno/comfyui-sdk';

import { generateUniqueSeeds } from '@/utils/number';

import { getOptimalComponent } from '../config/systemComponents';
import { FLUX_MODEL_CONFIG, WORKFLOW_DEFAULTS } from '../constants';
import { splitPromptForDualCLIP } from '../utils/promptSplitter';
import { selectOptimalWeightDtype } from '../utils/weightDType';

/**
 * FLUX Kontext 工作流构建器 / FLUX Kontext Workflow Builder
 *
 * @description 构建28步图像编辑生成工作流，支持文生图和图生图
 * Builds 28-step image editing workflow supporting text-to-image and image-to-image
 *
 * @param {string} modelName - 模型文件名 / Model filename
 * @param {Record<string, any>} params - 生成参数 / Generation parameters
 * @returns {PromptBuilder<any, any, any>} 构建的工作流 / Built workflow
 */
export function buildFluxKontextWorkflow(
  modelName: string,
  params: Record<string, any>,
): PromptBuilder<any, any, any> {
  // 获取最优组件
  const selectedT5Model = getOptimalComponent('t5');
  const selectedVAE = getOptimalComponent('vae');
  const selectedCLIP = getOptimalComponent('clip');

  // 检查是否有输入图像
  const hasInputImage = Boolean(params.imageUrl || params.imageUrls?.[0]);

  const workflow: any = {
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
        guider: ['14', 0], // Use BasicGuider output for GUIDER type
        latent_image: hasInputImage ? ['img_encode', 0] : ['7', 0], // 根据是否有输入图像选择latent来源
        model: ['4', 0],
        negative: ['6', 0], // Use FluxGuidance output for negative conditioning
        noise: ['13', 0],
        positive: ['6', 0], // Use FluxGuidance output for positive conditioning
        sampler: ['8', 0],
        sigmas: ['9', 0],
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
        filename_prefix: FLUX_MODEL_CONFIG.FILENAME_PREFIXES.KONTEXT,
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
        guidance: WORKFLOW_DEFAULTS.KONTEXT.CFG,
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
        guidance: WORKFLOW_DEFAULTS.KONTEXT.CFG,
      },
    },
    '8': {
      _meta: {
        title: 'K Sampler Select',
      },
      class_type: 'KSamplerSelect',
      inputs: {
        sampler_name: 'dpmpp_2m', // 图生图用普通DPM++（无SDE）
      },
    },
    '9': {
      _meta: {
        title: 'Basic Scheduler',
      },
      class_type: 'BasicScheduler',
      inputs: {
        denoise: hasInputImage ? (params.denoise ?? 0.75) : WORKFLOW_DEFAULTS.SAMPLING.DENOISE,
        model: ['4', 0],
        scheduler: 'karras',
        steps: WORKFLOW_DEFAULTS.KONTEXT.STEPS,
      },
    },
  };

  // 如果有输入图像，添加图像加载和编码节点
  if (hasInputImage) {
    workflow['img_load'] = {
      _meta: {
        title: 'Load Image',
      },
      class_type: 'LoadImage',
      inputs: {
        image: params.imageUrl || params.imageUrls?.[0] || '', // 直接设置图像URL
      },
    };

    workflow['img_encode'] = {
      _meta: {
        title: 'VAE Encode',
      },
      class_type: 'VAEEncode',
      inputs: {
        pixels: ['img_load', 0],
        vae: ['3', 0],
      },
    };
  } else {
    // 文生图模式，添加空白latent
    workflow['7'] = {
      _meta: {
        title: 'Empty SD3 Latent Image',
      },
      class_type: 'EmptySD3LatentImage',
      inputs: {
        batch_size: WORKFLOW_DEFAULTS.IMAGE.BATCH_SIZE,
        height: WORKFLOW_DEFAULTS.IMAGE.HEIGHT,
        width: WORKFLOW_DEFAULTS.IMAGE.WIDTH,
      },
    };
  }

  // 处理prompt分离 - 在工作流构建早期进行
  const { t5xxlPrompt, clipLPrompt } = splitPromptForDualCLIP(params.prompt ?? '');

  // 直接设置prompt值到工作流节点，而不依赖PromptBuilder的输入映射
  workflow['5'].inputs.clip_l = clipLPrompt;
  workflow['5'].inputs.t5xxl = t5xxlPrompt;

  // 创建 PromptBuilder - 移除prompt相关的输入参数，因为已直接设置
  const inputParams = ['width', 'height', 'steps', 'cfg', 'seed']; // 移除 'prompt_clip_l', 'prompt_t5xxl'
  if (hasInputImage) {
    inputParams.push('imageUrl', 'denoise');
  }

  const builder = new PromptBuilder(workflow, inputParams, ['images']);

  // 设置输出节点
  builder.setOutputNode('images', '12');

  // 保留其他参数的输入映射（不包括prompt相关）
  builder.setInputNode('seed', '13.inputs.noise_seed');
  builder.setInputNode('steps', '9.inputs.steps');
  builder.setInputNode('cfg', '6.inputs.guidance');

  // Map width/height to the appropriate node based on mode
  if (!hasInputImage) {
    // Text-to-image mode: Use EmptySD3LatentImage as primary (node '7' is guaranteed to exist)
    builder.setInputNode('width', '7.inputs.width');
    builder.setInputNode('height', '7.inputs.height');
  } else {
    // Image-to-image mode: Use ModelSamplingFlux as primary (node '4' always exists)
    builder.setInputNode('width', '4.inputs.width');
    builder.setInputNode('height', '4.inputs.height');
  }

  // 图生图模式下的额外映射
  if (hasInputImage) {
    builder.setInputNode('imageUrl', 'img_load.inputs.image');
    builder.setInputNode('denoise', '9.inputs.denoise');
  } else {
    // 文生图模式下仍然需要denoise映射，但会使用默认值
    builder.setInputNode('denoise', '9.inputs.denoise');
  }

  // Apply input values to workflow
  const width = params.width ?? WORKFLOW_DEFAULTS.IMAGE.WIDTH;
  const height = params.height ?? WORKFLOW_DEFAULTS.IMAGE.HEIGHT;
  const cfg = params.cfg ?? WORKFLOW_DEFAULTS.KONTEXT.CFG;

  // Manually set values for nodes that need the same parameters (since setInputNode can only map one-to-one)
  workflow['5'].inputs.guidance = cfg; // CLIPTextEncodeFlux needs guidance

  if (!hasInputImage) {
    // Text-to-image mode: ModelSamplingFlux needs width/height (EmptySD3LatentImage will get it via setInputNode)
    workflow['4'].inputs.width = width;
    workflow['4'].inputs.height = height;
  } else {
    // Image-to-image mode: EmptySD3LatentImage needs width/height (ModelSamplingFlux will get it via setInputNode)
    if (workflow['7']) {
      workflow['7'].inputs.width = width;
      workflow['7'].inputs.height = height;
    }
  }

  // 设置输入值（不包括prompt，已直接设置到工作流）
  builder
    .input('width', width)
    .input('height', height)
    .input('steps', params.steps ?? WORKFLOW_DEFAULTS.KONTEXT.STEPS)
    .input('cfg', cfg)
    .input('seed', params.seed ?? generateUniqueSeeds(1)[0]);

  if (hasInputImage) {
    builder
      .input('imageUrl', params.imageUrl || params.imageUrls?.[0] || '')
      .input('denoise', params.denoise ?? 0.75);
  } else {
    // 文生图模式使用默认denoise值
    builder.input('denoise', params.denoise ?? WORKFLOW_DEFAULTS.SAMPLING.DENOISE);
  }

  return builder;
}
