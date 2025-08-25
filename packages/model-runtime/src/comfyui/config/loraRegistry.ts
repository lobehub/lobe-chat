/**
 * LoRA Adapter Registry Configuration
 * XLabs-AI Official FLUX LoRA Adapters
 */

export interface LoRAConfig {
  /** Compatible model variants */
  compatibleVariants: string[];
  /** Model family this LoRA is designed for */
  modelFamily: 'FLUX';
  /** Priority level: 1=Official, 2=Professional, 3=Community */
  priority: number;
}

/* eslint-disable sort-keys-fix/sort-keys-fix */
export const LORA_REGISTRY: Record<string, LoRAConfig> = {
  // ===================================================================
  // === XLabs-AI Official FLUX LoRA Adapters (原有6个，保持不变) ===
  // === All Priority 1 (Official), All Compatible with FLUX.1-dev ===
  // ===================================================================

  'realism_lora.safetensors': {
    compatibleVariants: ['dev'],
    modelFamily: 'FLUX', // XLabs-AI Official
    priority: 1,
  },

  'anime_lora.safetensors': {
    compatibleVariants: ['dev'],
    modelFamily: 'FLUX', // XLabs-AI Official
    priority: 1,
  },

  'disney_lora.safetensors': {
    compatibleVariants: ['dev'],
    modelFamily: 'FLUX', // XLabs-AI Official
    priority: 1,
  },

  'scenery_lora.safetensors': {
    compatibleVariants: ['dev'],
    modelFamily: 'FLUX', // XLabs-AI Official
    priority: 1,
  },

  'art_lora.safetensors': {
    compatibleVariants: ['dev'],
    modelFamily: 'FLUX', // XLabs-AI Official
    priority: 1,
  },

  'mjv6_lora.safetensors': {
    compatibleVariants: ['dev'],
    modelFamily: 'FLUX', // XLabs-AI Official
    priority: 1,
  },

  // ===================================================================
  // === RFC-128 权威数据源扩展：新增 14 个 LoRA 模型 ===
  // === 基于 FLUX模型合并验证表格-基于项目真实底模-2025-08-23.md ===
  // ===================================================================

  // === XLabs-AI Professional LoRA (新发现) ===
  'flux-realism-lora.safetensors': {
    compatibleVariants: ['dev'],
    modelFamily: 'FLUX', // XLabs-AI Official
    priority: 1,
  },

  'flux-lora-collection-8-styles.safetensors': {
    compatibleVariants: ['dev'],
    modelFamily: 'FLUX', // XLabs-AI Official
    priority: 1,
  },

  'disney-anime-art-lora.safetensors': {
    compatibleVariants: ['dev'],
    modelFamily: 'FLUX', // XLabs-AI Official
    priority: 1,
  },

  // === LiblibAI Professional LoRA ===
  'flux-kodak-grain-lora.safetensors': {
    compatibleVariants: ['dev'],
    modelFamily: 'FLUX', // LiblibAI Professional
    priority: 2,
  },

  'flux-first-person-selfie-lora.safetensors': {
    compatibleVariants: ['dev'],
    modelFamily: 'FLUX', // LiblibAI Professional
    priority: 2,
  },

  'flux-anime-rainbow-light-lora.safetensors': {
    compatibleVariants: ['dev'],
    modelFamily: 'FLUX', // LiblibAI Professional
    priority: 2,
  },

  'flux-detailer-enhancement-lora.safetensors': {
    compatibleVariants: ['dev'],
    modelFamily: 'FLUX', // LiblibAI Professional
    priority: 2,
  },

  // === CivitAI Special Effects LoRA ===
  'Envy_Flux_Reanimated_lora.safetensors': {
    compatibleVariants: ['dev'],
    modelFamily: 'FLUX', // CivitAI Professional
    priority: 2,
  },

  'Photon_Construct_Flux_V1_0_lora.safetensors': {
    compatibleVariants: ['dev'],
    modelFamily: 'FLUX', // CivitAI Professional
    priority: 2,
  },

  // === ModelScope LoRA Collection ===
  'flux-ultimate-lora-collection.safetensors': {
    compatibleVariants: ['dev'],
    modelFamily: 'FLUX', // ModelScope Professional
    priority: 2,
  },

  'artaug-flux-enhancement-lora.safetensors': {
    compatibleVariants: ['dev'],
    modelFamily: 'FLUX', // ModelScope Professional
    priority: 2,
  },

  'flux-canny-dev-lora.safetensors': {
    compatibleVariants: ['dev'],
    modelFamily: 'FLUX', // ModelScope Professional
    priority: 2,
  },

  // === Community and Experimental LoRA ===
  'watercolor_painting_schnell_lora.safetensors': {
    compatibleVariants: ['schnell'],
    modelFamily: 'FLUX', // Community Specialized
    priority: 3,
  },

  'juggernaut_lora_flux.safetensors': {
    compatibleVariants: ['dev'],
    modelFamily: 'FLUX', // Community Professional
    priority: 3,
  },

  'chinese-style-flux-lora-collection.safetensors': {
    compatibleVariants: ['dev'],
    modelFamily: 'FLUX', // Community Cultural
    priority: 3,
  },

  'flux-medical-environment-lora.safetensors': {
    compatibleVariants: ['kontext'],
    modelFamily: 'FLUX', // Community Specialized
    priority: 3,
  },

  'flux-fill-object-removal.safetensors': {
    compatibleVariants: ['kontext'],
    modelFamily: 'FLUX', // Community Specialized
    priority: 3,
  },
} as const;

/**
 * Get LoRA config - name required, others optional
 */
export function getLoRAConfig(
  loraName: string,
  options?: {
    compatibleVariant?: string;
    modelFamily?: LoRAConfig['modelFamily'];
    priority?: number;
  },
): LoRAConfig | undefined {
  const config = LORA_REGISTRY[loraName];
  if (!config) return undefined;

  if (!options) return config;

  const matches =
    (!options.priority || config.priority === options.priority) &&
    (!options.modelFamily || config.modelFamily === options.modelFamily) &&
    (!options.compatibleVariant || config.compatibleVariants.includes(options.compatibleVariant));

  return matches ? config : undefined;
}

/**
 * Get all LoRA configs matching filters
 */
export function getAllLoRAConfigs(options?: {
  compatibleVariant?: string;
  modelFamily?: LoRAConfig['modelFamily'];
  priority?: number;
}): LoRAConfig[] {
  if (!options) return Object.values(LORA_REGISTRY);

  return Object.values(LORA_REGISTRY).filter(
    (config) =>
      (!options.priority || config.priority === options.priority) &&
      (!options.modelFamily || config.modelFamily === options.modelFamily) &&
      (!options.compatibleVariant || config.compatibleVariants.includes(options.compatibleVariant)),
  );
}
