/**
 * Simple Workflow Detector
 *
 * Replaces 257 lines of complex pattern matching with simple O(1) lookups.
 * KISS principle: Keep It Simple, Stupid.
 */
import { resolveModel } from './modelResolver';
import type { WorkflowDetectionResult } from './workflowRouter';

export type FluxVariant = 'dev' | 'schnell' | 'kontext' | 'krea';

/**
 * Simple workflow type detector using model registry
 */
export class WorkflowDetector {
  /**
   * Detect model type using model registry - O(1) lookup
   */
  static detectModelType(modelId: string): WorkflowDetectionResult {
    const cleanId = modelId.replace(/^comfyui\//, '');

    // Check if model exists in registry
    const config = resolveModel(cleanId);

    if (config && config.modelFamily === 'FLUX') {
      return {
        architecture: 'FLUX',
        isSupported: true,
        variant: this.getVariant(cleanId, config.variant),
      };
    }

    return {
      architecture: 'unknown',
      isSupported: false,
    };
  }

  /**
   * Get FLUX variant from model config
   */
  private static getVariant(modelId: string, configVariant: string): FluxVariant {
    return configVariant as FluxVariant;
  }
}
