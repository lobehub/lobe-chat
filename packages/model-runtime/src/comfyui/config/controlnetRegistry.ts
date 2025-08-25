/**
 * ControlNet Registry Configuration
 * XLabs-AI Official FLUX ControlNet Models
 */

export interface ControlNetConfig {
  /** Compatible model variants */
  compatibleVariants: string[];
  /** Model family this ControlNet is designed for */
  modelFamily: 'FLUX';
  /** Priority level: 1=Official, 2=Community, 3=Experimental */
  priority: number;
  /** ControlNet type */
  type: 'canny' | 'depth' | 'hed' | 'pose' | 'scribble' | 'normal' | 'semantic';
}

/* eslint-disable sort-keys-fix/sort-keys-fix */
export const CONTROLNET_REGISTRY: Record<string, ControlNetConfig> = {
  // ===================================================================
  // === XLabs-AI Official FLUX ControlNet Models ===
  // === All Priority 1 (Official), All Compatible with FLUX.1-dev ===
  // ===================================================================

  'flux-controlnet-canny-v3.safetensors': {
    compatibleVariants: ['dev'],
    modelFamily: 'FLUX',
    priority: 1,
    type: 'canny',
  },

  'flux-controlnet-depth-v3.safetensors': {
    compatibleVariants: ['dev'],
    modelFamily: 'FLUX',
    priority: 1,
    type: 'depth',
  },

  'flux-controlnet-hed-v3.safetensors': {
    compatibleVariants: ['dev'],
    modelFamily: 'FLUX',
    priority: 1,
    type: 'hed',
  },
} as const;

/**
 * Get ControlNet config - name required, others optional
 */
export function getControlNetConfig(
  controlnetName: string,
  options?: {
    compatibleVariant?: string;
    modelFamily?: ControlNetConfig['modelFamily'];
    priority?: number;
    type?: ControlNetConfig['type'];
  },
): ControlNetConfig | undefined {
  const config = CONTROLNET_REGISTRY[controlnetName];
  if (!config) return undefined;

  if (!options) return config;

  const matches =
    (!options.type || config.type === options.type) &&
    (!options.priority || config.priority === options.priority) &&
    (!options.modelFamily || config.modelFamily === options.modelFamily) &&
    (!options.compatibleVariant || config.compatibleVariants.includes(options.compatibleVariant));

  return matches ? config : undefined;
}

/**
 * Get all ControlNet configs matching filters
 */
export function getAllControlNetConfigs(options?: {
  compatibleVariant?: string;
  modelFamily?: ControlNetConfig['modelFamily'];
  priority?: number;
  type?: ControlNetConfig['type'];
}): ControlNetConfig[] {
  if (!options) return Object.values(CONTROLNET_REGISTRY);

  return Object.values(CONTROLNET_REGISTRY).filter(
    (config) =>
      (!options.type || config.type === options.type) &&
      (!options.priority || config.priority === options.priority) &&
      (!options.modelFamily || config.modelFamily === options.modelFamily) &&
      (!options.compatibleVariant || config.compatibleVariants.includes(options.compatibleVariant)),
  );
}
