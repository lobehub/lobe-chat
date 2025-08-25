/**
 * System Components Registry Configuration
 * FLUX模型系统编码器组件配置 (5个)
 */
import { AgentRuntimeErrorType } from '../../error';
import { AgentRuntimeError } from '../../utils/createError';

export interface ComponentConfig {
  /** Model family this component is designed for */
  modelFamily: 'FLUX';
  /** Priority level: 1=Essential, 2=Standard, 3=Optional */
  priority: number;
  /** Component type: vae, clip, or t5 encoder */
  type: 'vae' | 'clip' | 't5';
}

/* eslint-disable sort-keys-fix/sort-keys-fix */
export const SYSTEM_COMPONENTS: Record<string, ComponentConfig> = {
  // ===================================================================
  // === ESSENTIAL COMPONENTS (Priority 1) ===
  // ===================================================================

  'ae.safetensors': {
    modelFamily: 'FLUX',
    priority: 1,
    type: 'vae',
  },

  'clip_l.safetensors': {
    modelFamily: 'FLUX',
    priority: 1,
    type: 'clip',
  },

  't5xxl_fp16.safetensors': {
    modelFamily: 'FLUX',
    priority: 1,
    type: 't5',
  },

  // ===================================================================
  // === OPTIONAL COMPONENTS ===
  // ===================================================================
  't5xxl_fp8_e4m3fn.safetensors': {
    modelFamily: 'FLUX',
    priority: 2,
    type: 't5',
  },

  't5xxl_fp8_e5m2.safetensors': {
    modelFamily: 'FLUX',
    priority: 2,
    type: 't5',
  },

  'google_t5-v1_1-xxl_encoderonly-fp16.safetensors': {
    modelFamily: 'FLUX',
    priority: 3,
    type: 't5',
  },
} as const;

/**
 * Universal component query function
 * Get single component config
 */
export function getComponentConfig(
  componentName: string,
  options?: {
    modelFamily?: ComponentConfig['modelFamily'];
    priority?: number;
    type?: ComponentConfig['type'];
  },
): ComponentConfig | undefined {
  const config = SYSTEM_COMPONENTS[componentName];
  if (!config) return undefined;

  // No filters - return the config
  if (!options) return config;

  // Check filters
  const matches =
    (!options.type || config.type === options.type) &&
    (!options.priority || config.priority === options.priority) &&
    (!options.modelFamily || config.modelFamily === options.modelFamily);

  return matches ? config : undefined;
}

/**
 * Get all component configs matching filters
 */
export function getAllComponentConfigs(options?: {
  modelFamily?: ComponentConfig['modelFamily'];
  priority?: number;
  type?: ComponentConfig['type'];
}): ComponentConfig[] {
  if (!options) return Object.values(SYSTEM_COMPONENTS);

  return Object.values(SYSTEM_COMPONENTS).filter(
    (config) =>
      (!options.type || config.type === options.type) &&
      (!options.priority || config.priority === options.priority) &&
      (!options.modelFamily || config.modelFamily === options.modelFamily),
  );
}

/**
 * Get all components with names matching filters
 */
export function getAllComponentsWithNames(options?: {
  modelFamily?: ComponentConfig['modelFamily'];
  priority?: number;
  type?: ComponentConfig['type'];
}): Array<{ config: ComponentConfig, name: string; }> {
  return Object.entries(SYSTEM_COMPONENTS)
    .filter(
      ([, config]) =>
        (!options?.type || config.type === options.type) &&
        (!options?.priority || config.priority === options.priority) &&
        (!options?.modelFamily || config.modelFamily === options.modelFamily),
    )
    .map(([name, config]) => ({ name, config }));
}

/**
 * Get optimal component of specified type
 */
export function getOptimalComponent(type: ComponentConfig['type']): string {
  const components = getAllComponentsWithNames({ type }).sort(
    (a, b) => a.config.priority - b.config.priority,
  );

  if (components.length === 0) {
    throw AgentRuntimeError.createError(AgentRuntimeErrorType.ModelNotFound, {
      error: `No ${type} components configured in system`,
    });
  }

  return components[0].name;
}
