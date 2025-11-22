import { ModelParamsSchema } from '../standard-parameters';
import { AIChatModelCard, AIImageModelCard } from '../types/aiModel';

const defaultImageParams: ModelParamsSchema = {
  prompt: { default: '' },
  seed: { default: null },
  size: {
    default: '1024x1024',
    enum: ['512x512', '768x768', '1024x1024', '1280x720', '720x1280', '1024x768', '768x1024'],
  },
};

// Parameters for image-to-image models (Canny, Depth)
const controlImageParams: ModelParamsSchema = {
  imageUrl: {
    default: null,
    description: 'Control image (Canny edge map or depth map)',
    type: ['string', 'null'],
  },
  prompt: { default: '' },
  seed: { default: null },
  steps: {
    default: 50,
    max: 50,
    min: 15,
    step: 1,
  },
};

// Parameters for inpainting/fill model
const fillImageParams: ModelParamsSchema = {
  imageUrl: {
    default: null,
    description: 'Base image to inpaint or outpaint',
    type: ['string', 'null'],
  },
  prompt: { default: '' },
  seed: { default: null },
  steps: {
    default: 50,
    max: 50,
    min: 15,
    step: 1,
  },
};

// Parameters for Redux (image variation/mixing - no prompt needed)
const reduxImageParams: ModelParamsSchema = {
  
aspectRatio: {
    default: '1:1',
    enum: ['1:1', '16:9', '9:16', '3:2', '2:3', '4:3', '3:4'],
  }, 
  // Redux doesn't use prompt, but keep for UI compatibility
imageUrl: {
    default: null,
    description: 'Input image for creating variations (required for Redux)',
    type: ['string', 'null'],
  },
  prompt: { default: '' },
  seed: { default: null },
};

const replicateChatModels: AIChatModelCard[] = [
  {
    abilities: {
      functionCall: false,
    },
    contextWindowTokens: 4096,
    description:
      'Llama 2 70B Chat is a fine-tuned version of Llama 2 for conversational use cases.',
    displayName: 'Llama 2 70B Chat',
    enabled: true,
    id: 'meta/llama-2-70b-chat',
    type: 'chat',
  },
  {
    abilities: {
      functionCall: false,
    },
    contextWindowTokens: 8192,
    description:
      'Mistral 7B Instruct is a 7-billion parameter language model optimized for instruction following.',
    displayName: 'Mistral 7B Instruct',
    enabled: true,
    id: 'mistralai/mistral-7b-instruct-v0.2',
    type: 'chat',
  },
];

const replicateImageModels: AIImageModelCard[] = [
  {
    description:
      'FLUX.1 Pro: State-of-the-art image generation with top-of-the-line prompt following, visual quality, image detail and output diversity.',
    displayName: 'FLUX 1.1 Pro',
    enabled: true,
    id: 'black-forest-labs/flux-1.1-pro',
    parameters: defaultImageParams,
    type: 'image',
  },
  {
    description: 'FLUX.1 Dev: Fast, high-quality image generation model.',
    displayName: 'FLUX 1 Dev',
    enabled: true,
    id: 'black-forest-labs/flux-dev',
    parameters: defaultImageParams,
    type: 'image',
  },
  {
    description: 'FLUX.1 Schnell: Ultra-fast image generation in 1-4 steps.',
    displayName: 'FLUX 1 Schnell',
    enabled: true,
    id: 'black-forest-labs/flux-schnell',
    parameters: defaultImageParams,
    type: 'image',
  },
  {
    description: 'Stable Diffusion XL: A powerful text-to-image generation model.',
    displayName: 'Stable Diffusion XL',
    enabled: true,
    id: 'stability-ai/sdxl',
    parameters: defaultImageParams,
    type: 'image',
  },
  {
    description:
      'Stable Diffusion 3.5: Latest generation of Stable Diffusion with improved quality.',
    displayName: 'Stable Diffusion 3.5',
    enabled: true,
    id: 'stability-ai/stable-diffusion-3.5-large',
    parameters: defaultImageParams,
    type: 'image',
  },
  {
    description: 'Ideogram V2: Advanced text-to-image model with excellent text rendering.',
    displayName: 'Ideogram V2',
    enabled: true,
    id: 'ideogram-ai/ideogram-v2',
    parameters: defaultImageParams,
    type: 'image',
  },
  // Image-to-Image models
  {
    description: 'FLUX.1 Redux Dev: Create variations and transformations of existing images.',
    displayName: 'FLUX 1 Redux Dev',
    enabled: true,
    id: 'black-forest-labs/flux-redux-dev',
    parameters: reduxImageParams,
    type: 'image',
  },
  {
    description:
      'FLUX.1 Canny Pro: Generate images with precise structural control using edge detection.',
    displayName: 'FLUX 1 Canny Pro',
    enabled: true,
    id: 'black-forest-labs/flux-canny-pro',
    parameters: controlImageParams,
    type: 'image',
  },
  {
    description:
      'FLUX.1 Depth Pro: Generate images preserving spatial relationships using depth maps.',
    displayName: 'FLUX 1 Depth Pro',
    enabled: true,
    id: 'black-forest-labs/flux-depth-pro',
    parameters: controlImageParams,
    type: 'image',
  },
  {
    description: 'FLUX.1 Fill Pro: Professional inpainting and outpainting for image editing.',
    displayName: 'FLUX 1 Fill Pro',
    enabled: true,
    id: 'black-forest-labs/flux-fill-pro',
    parameters: fillImageParams,
    type: 'image',
  },
];

export default [...replicateChatModels, ...replicateImageModels];
