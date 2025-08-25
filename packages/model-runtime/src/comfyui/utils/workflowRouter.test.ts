import type { PromptBuilder } from '@saintno/comfyui-sdk';
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest';

import { AgentRuntimeErrorType } from '../../error';
import { buildFluxDevWorkflow } from '../workflows/flux-dev';
import { buildFluxKontextWorkflow } from '../workflows/flux-kontext';
import { buildFluxKreaWorkflow } from '../workflows/flux-krea';
import { buildFluxSchnellWorkflow } from '../workflows/flux-schnell';
import { type WorkflowDetectionResult, WorkflowRouter } from './workflowRouter';

// Mock workflow builders
vi.mock('../workflows/flux-dev', () => ({
  buildFluxDevWorkflow: vi.fn(),
}));

vi.mock('../workflows/flux-kontext', () => ({
  buildFluxKontextWorkflow: vi.fn(),
}));

vi.mock('../workflows/flux-krea', () => ({
  buildFluxKreaWorkflow: vi.fn(),
}));

vi.mock('../workflows/flux-schnell', () => ({
  buildFluxSchnellWorkflow: vi.fn(),
}));

describe('WorkflowRouter', () => {
  let mockPromptBuilder: PromptBuilder<any, any, any>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock PromptBuilder instance
    mockPromptBuilder = {
      prompt: { '1': { class_type: 'TestNode', inputs: {} } },
      input: vi.fn(),
      clone: vi.fn(),
    } as unknown as PromptBuilder<any, any, any>;

    // Setup workflow builder mocks
    (buildFluxDevWorkflow as Mock).mockReturnValue(mockPromptBuilder);
    (buildFluxSchnellWorkflow as Mock).mockReturnValue(mockPromptBuilder);
    (buildFluxKontextWorkflow as Mock).mockReturnValue(mockPromptBuilder);
    (buildFluxKreaWorkflow as Mock).mockReturnValue(mockPromptBuilder);
  });

  describe('Factory Pattern - routeWorkflow', () => {
    describe('Input Validation', () => {
      it('should throw AgentRuntimeError when modelId is null', () => {
        const detectionResult: WorkflowDetectionResult = {
          architecture: 'FLUX',
          isSupported: true,
        };

        try {
          WorkflowRouter.routeWorkflow(null as any, detectionResult, 'test.safetensors');
          expect.fail('Should have thrown an error');
        } catch (error: any) {
          expect(error).toHaveProperty('errorType', AgentRuntimeErrorType.ComfyUIWorkflowError);
          expect(error.error).toHaveProperty(
            'message',
            'Invalid parameters: modelId and detectionResult are required',
          );
        }
      });

      it('should throw AgentRuntimeError when modelId is undefined', () => {
        const detectionResult: WorkflowDetectionResult = {
          architecture: 'FLUX',
          isSupported: true,
        };

        try {
          WorkflowRouter.routeWorkflow(undefined as any, detectionResult, 'test.safetensors');
          expect.fail('Should have thrown an error');
        } catch (error: any) {
          expect(error).toHaveProperty('errorType', AgentRuntimeErrorType.ComfyUIWorkflowError);
        }
      });

      it('should throw AgentRuntimeError when modelId is empty string', () => {
        const detectionResult: WorkflowDetectionResult = {
          architecture: 'FLUX',
          isSupported: true,
        };

        try {
          WorkflowRouter.routeWorkflow('', detectionResult, 'test.safetensors');
          expect.fail('Should have thrown an error');
        } catch (error: any) {
          expect(error).toHaveProperty('errorType', AgentRuntimeErrorType.ComfyUIWorkflowError);
        }
      });

      it('should throw AgentRuntimeError when detectionResult is null', () => {
        try {
          WorkflowRouter.routeWorkflow('flux-dev', null as any, 'test.safetensors');
          expect.fail('Should have thrown an error');
        } catch (error: any) {
          expect(error).toHaveProperty('errorType', AgentRuntimeErrorType.ComfyUIWorkflowError);
        }
      });

      it('should throw AgentRuntimeError when detectionResult is undefined', () => {
        try {
          WorkflowRouter.routeWorkflow('flux-dev', undefined as any, 'test.safetensors');
          expect.fail('Should have thrown an error');
        } catch (error: any) {
          expect(error).toHaveProperty('errorType', AgentRuntimeErrorType.ComfyUIWorkflowError);
        }
      });

      it('should include modelId in error when validation fails', () => {
        const detectionResult: WorkflowDetectionResult = {
          architecture: 'FLUX',
          isSupported: true,
        };

        try {
          WorkflowRouter.routeWorkflow('', detectionResult, 'test.safetensors');
          expect.fail('Should have thrown an error');
        } catch (error: any) {
          expect(error).toHaveProperty('errorType', AgentRuntimeErrorType.ComfyUIWorkflowError);
          expect(error.error).toHaveProperty('modelId', '');
        }
      });
    });

    describe('Support Validation', () => {
      it('should throw AgentRuntimeError when model is not supported', () => {
        const detectionResult: WorkflowDetectionResult = {
          architecture: 'unknown',
          isSupported: false,
        };

        try {
          WorkflowRouter.routeWorkflow('unknown-model', detectionResult, 'test.safetensors');
          expect.fail('Should have thrown an error');
        } catch (error: any) {
          expect(error).toHaveProperty('errorType', AgentRuntimeErrorType.ComfyUIWorkflowError);
          expect(error.error).toHaveProperty(
            'message',
            'Unsupported model architecture: unknown for model unknown-model',
          );
        }
      });

      it('should include modelId in unsupported error', () => {
        const detectionResult: WorkflowDetectionResult = {
          architecture: 'unknown',
          isSupported: false,
        };

        try {
          WorkflowRouter.routeWorkflow('stable-diffusion-v1', detectionResult, 'test.safetensors');
          expect.fail('Should have thrown an error');
        } catch (error: any) {
          expect(error).toHaveProperty('errorType', AgentRuntimeErrorType.ComfyUIWorkflowError);
          expect(error.error).toHaveProperty('modelId', 'stable-diffusion-v1');
        }
      });
    });

    describe('Exact Model Matching', () => {
      const supportedResult: WorkflowDetectionResult = {
        architecture: 'FLUX',
        isSupported: true,
      };

      it('should route flux-dev to buildFluxDevWorkflow', () => {
        const result = WorkflowRouter.routeWorkflow(
          'flux-dev',
          supportedResult,
          'flux-dev.safetensors',
          { steps: 20 },
        );

        expect(buildFluxDevWorkflow).toHaveBeenCalledWith('flux-dev.safetensors', { steps: 20 });
        expect(result).toBe(mockPromptBuilder);
      });

      it('should route flux-kontext-dev to buildFluxKontextWorkflow', () => {
        const result = WorkflowRouter.routeWorkflow(
          'flux-kontext-dev',
          supportedResult,
          'flux-kontext-dev.safetensors',
          { guidance: 7.5 },
        );

        expect(buildFluxKontextWorkflow).toHaveBeenCalledWith('flux-kontext-dev.safetensors', {
          guidance: 7.5,
        });
        expect(result).toBe(mockPromptBuilder);
      });

      it('should route flux-krea-dev to buildFluxKreaWorkflow', () => {
        const result = WorkflowRouter.routeWorkflow(
          'flux-krea-dev',
          supportedResult,
          'flux-krea-dev.safetensors',
          { cfg: 3.5 },
        );

        expect(buildFluxKreaWorkflow).toHaveBeenCalledWith('flux-krea-dev.safetensors', {
          cfg: 3.5,
        });
        expect(result).toBe(mockPromptBuilder);
      });

      it('should route flux-schnell to buildFluxSchnellWorkflow', () => {
        const result = WorkflowRouter.routeWorkflow(
          'flux-schnell',
          supportedResult,
          'flux-schnell.safetensors',
          { steps: 4 },
        );

        expect(buildFluxSchnellWorkflow).toHaveBeenCalledWith('flux-schnell.safetensors', {
          steps: 4,
        });
        expect(result).toBe(mockPromptBuilder);
      });

      it('should pass empty params when not provided', () => {
        WorkflowRouter.routeWorkflow('flux-dev', supportedResult, 'flux-dev.safetensors');

        expect(buildFluxDevWorkflow).toHaveBeenCalledWith('flux-dev.safetensors', {});
      });

      it('should pass empty params when params is undefined', () => {
        WorkflowRouter.routeWorkflow(
          'flux-dev',
          supportedResult,
          'flux-dev.safetensors',
          undefined,
        );

        expect(buildFluxDevWorkflow).toHaveBeenCalledWith('flux-dev.safetensors', {});
      });
    });

    describe('Variant Fallback Matching', () => {
      it('should fallback to dev variant for supported flux models', () => {
        const detectionResult: WorkflowDetectionResult = {
          architecture: 'FLUX',
          variant: 'dev',
          isSupported: true,
        };

        const result = WorkflowRouter.routeWorkflow(
          'some-flux-dev-model',
          detectionResult,
          'custom-flux-dev.safetensors',
          { sampler: 'euler' },
        );

        expect(buildFluxDevWorkflow).toHaveBeenCalledWith('custom-flux-dev.safetensors', {
          sampler: 'euler',
        });
        expect(result).toBe(mockPromptBuilder);
      });

      it('should fallback to schnell variant for supported flux models', () => {
        const detectionResult: WorkflowDetectionResult = {
          architecture: 'FLUX',
          variant: 'schnell',
          isSupported: true,
        };

        const result = WorkflowRouter.routeWorkflow(
          'some-flux-schnell-model',
          detectionResult,
          'custom-flux-schnell.safetensors',
        );

        expect(buildFluxSchnellWorkflow).toHaveBeenCalledWith(
          'custom-flux-schnell.safetensors',
          {},
        );
        expect(result).toBe(mockPromptBuilder);
      });

      it('should fallback to kontext variant for supported flux models', () => {
        const detectionResult: WorkflowDetectionResult = {
          architecture: 'FLUX',
          variant: 'kontext',
          isSupported: true,
        };

        const result = WorkflowRouter.routeWorkflow(
          'some-flux-kontext-model',
          detectionResult,
          'custom-flux-kontext.safetensors',
        );

        expect(buildFluxKontextWorkflow).toHaveBeenCalledWith(
          'custom-flux-kontext.safetensors',
          {},
        );
        expect(result).toBe(mockPromptBuilder);
      });

      it('should fallback to krea variant for supported flux models', () => {
        const detectionResult: WorkflowDetectionResult = {
          architecture: 'FLUX',
          variant: 'krea',
          isSupported: true,
        };

        const result = WorkflowRouter.routeWorkflow(
          'some-flux-krea-model',
          detectionResult,
          'custom-flux-krea.safetensors',
        );

        expect(buildFluxKreaWorkflow).toHaveBeenCalledWith('custom-flux-krea.safetensors', {});
        expect(result).toBe(mockPromptBuilder);
      });

      it('should prefer exact match over variant fallback', () => {
        const detectionResult: WorkflowDetectionResult = {
          architecture: 'FLUX',
          variant: 'schnell', // This should be ignored
          isSupported: true,
        };

        // flux-dev has exact match, so it should not fall back to schnell variant
        const result = WorkflowRouter.routeWorkflow(
          'flux-dev',
          detectionResult,
          'flux-dev.safetensors',
        );

        expect(buildFluxDevWorkflow).toHaveBeenCalledWith('flux-dev.safetensors', {});
        expect(buildFluxSchnellWorkflow).not.toHaveBeenCalled();
        expect(result).toBe(mockPromptBuilder);
      });
    });

    describe('No Match Scenarios', () => {
      it('should throw AgentRuntimeError when no exact match and no variant', () => {
        const detectionResult: WorkflowDetectionResult = {
          architecture: 'FLUX',
          isSupported: true,
          // No variant provided
        };

        try {
          WorkflowRouter.routeWorkflow('unknown-flux-model', detectionResult, 'test.safetensors');
          expect.fail('Should have thrown an error');
        } catch (error: any) {
          expect(error).toHaveProperty('errorType', AgentRuntimeErrorType.ComfyUIWorkflowError);
          expect(error.error.message).toContain(
            'No workflow builder found for model unknown-flux-model',
          );
        }
      });

      it('should throw AgentRuntimeError when variant is not supported', () => {
        const detectionResult: WorkflowDetectionResult = {
          architecture: 'FLUX',
          variant: 'unknown-variant' as any,
          isSupported: true,
        };

        try {
          WorkflowRouter.routeWorkflow('unknown-flux-model', detectionResult, 'test.safetensors');
          expect.fail('Should have thrown an error');
        } catch (error: any) {
          expect(error).toHaveProperty('errorType', AgentRuntimeErrorType.ComfyUIWorkflowError);
          expect(error.error.message).toContain('architecture: FLUX, variant: unknown-variant');
        }
      });

      it('should handle null variant gracefully in error message', () => {
        const detectionResult: WorkflowDetectionResult = {
          architecture: 'FLUX',
          variant: null as any,
          isSupported: true,
        };

        try {
          WorkflowRouter.routeWorkflow('unknown-flux-model', detectionResult, 'test.safetensors');
          expect.fail('Should have thrown an error');
        } catch (error: any) {
          expect(error).toHaveProperty('errorType', AgentRuntimeErrorType.ComfyUIWorkflowError);
          expect(error.error.message).toContain('variant: unknown');
        }
      });

      it('should handle undefined variant gracefully in error message', () => {
        const detectionResult: WorkflowDetectionResult = {
          architecture: 'FLUX',
          variant: undefined,
          isSupported: true,
        };

        try {
          WorkflowRouter.routeWorkflow('unknown-flux-model', detectionResult, 'test.safetensors');
          expect.fail('Should have thrown an error');
        } catch (error: any) {
          expect(error).toHaveProperty('errorType', AgentRuntimeErrorType.ComfyUIWorkflowError);
          expect(error.error.message).toContain('variant: unknown');
        }
      });

      it('should include modelId in no match error', () => {
        const detectionResult: WorkflowDetectionResult = {
          architecture: 'FLUX',
          isSupported: true,
        };

        try {
          WorkflowRouter.routeWorkflow('unsupported-model', detectionResult, 'test.safetensors');
          expect.fail('Should have thrown an error');
        } catch (error: any) {
          expect(error).toHaveProperty('errorType', AgentRuntimeErrorType.ComfyUIWorkflowError);
          expect(error.error).toHaveProperty('modelId', 'unsupported-model');
        }
      });
    });
  });

  describe('Utility Methods', () => {
    describe('getExactlySupportedModels', () => {
      it('should return all exact model IDs', () => {
        const models = WorkflowRouter.getExactlySupportedModels();
        expect(models).toEqual(['flux-dev', 'flux-kontext-dev', 'flux-krea-dev', 'flux-schnell']);
      });

      it('should return array of strings', () => {
        const models = WorkflowRouter.getExactlySupportedModels();
        expect(Array.isArray(models)).toBe(true);
        models.forEach((model) => {
          expect(typeof model).toBe('string');
        });
      });

      it('should return same result on multiple calls', () => {
        const models1 = WorkflowRouter.getExactlySupportedModels();
        const models2 = WorkflowRouter.getExactlySupportedModels();
        expect(models1).toEqual(models2);
      });
    });

    describe('getSupportedFluxVariants', () => {
      it('should return all supported variants', () => {
        const variants = WorkflowRouter.getSupportedFluxVariants();
        expect(variants).toEqual(['dev', 'kontext', 'krea', 'schnell']);
      });

      it('should return array of strings', () => {
        const variants = WorkflowRouter.getSupportedFluxVariants();
        expect(Array.isArray(variants)).toBe(true);
        variants.forEach((variant) => {
          expect(typeof variant).toBe('string');
        });
      });

      it('should return same result on multiple calls', () => {
        const variants1 = WorkflowRouter.getSupportedFluxVariants();
        const variants2 = WorkflowRouter.getSupportedFluxVariants();
        expect(variants1).toEqual(variants2);
      });
    });

    describe('hasExactSupport', () => {
      it('should return true for supported exact models', () => {
        expect(WorkflowRouter.hasExactSupport('flux-dev')).toBe(true);
        expect(WorkflowRouter.hasExactSupport('flux-kontext-dev')).toBe(true);
        expect(WorkflowRouter.hasExactSupport('flux-krea-dev')).toBe(true);
        expect(WorkflowRouter.hasExactSupport('flux-schnell')).toBe(true);
      });

      it('should return false for unsupported models', () => {
        expect(WorkflowRouter.hasExactSupport('unknown-model')).toBe(false);
        expect(WorkflowRouter.hasExactSupport('stable-diffusion')).toBe(false);
        expect(WorkflowRouter.hasExactSupport('flux')).toBe(false);
        expect(WorkflowRouter.hasExactSupport('')).toBe(false);
      });

      it('should handle null and undefined gracefully', () => {
        expect(WorkflowRouter.hasExactSupport(null as any)).toBe(false);
        expect(WorkflowRouter.hasExactSupport(undefined as any)).toBe(false);
      });

      it('should be case sensitive', () => {
        expect(WorkflowRouter.hasExactSupport('FLUX-DEV')).toBe(false);
        expect(WorkflowRouter.hasExactSupport('Flux-Dev')).toBe(false);
        expect(WorkflowRouter.hasExactSupport('flux-DEV')).toBe(false);
      });
    });

    describe('hasVariantSupport', () => {
      it('should return true for supported variants', () => {
        expect(WorkflowRouter.hasVariantSupport('dev')).toBe(true);
        expect(WorkflowRouter.hasVariantSupport('kontext')).toBe(true);
        expect(WorkflowRouter.hasVariantSupport('krea')).toBe(true);
        expect(WorkflowRouter.hasVariantSupport('schnell')).toBe(true);
      });

      it('should return false for unsupported variants', () => {
        expect(WorkflowRouter.hasVariantSupport('unknown')).toBe(false);
        expect(WorkflowRouter.hasVariantSupport('xl')).toBe(false);
        expect(WorkflowRouter.hasVariantSupport('turbo')).toBe(false);
        expect(WorkflowRouter.hasVariantSupport('')).toBe(false);
      });

      it('should handle null and undefined gracefully', () => {
        expect(WorkflowRouter.hasVariantSupport(null as any)).toBe(false);
        expect(WorkflowRouter.hasVariantSupport(undefined as any)).toBe(false);
      });

      it('should be case sensitive', () => {
        expect(WorkflowRouter.hasVariantSupport('DEV')).toBe(false);
        expect(WorkflowRouter.hasVariantSupport('Dev')).toBe(false);
        expect(WorkflowRouter.hasVariantSupport('SCHNELL')).toBe(false);
      });
    });

    describe('getRoutingStats', () => {
      it('should return correct statistics', () => {
        const stats = WorkflowRouter.getRoutingStats();

        expect(stats).toEqual({
          exactModelsCount: 4,
          supportedVariantsCount: 4,
          totalBuilders: 4, // All builders are unique
        });
      });

      it('should return object with correct properties', () => {
        const stats = WorkflowRouter.getRoutingStats();

        expect(typeof stats.exactModelsCount).toBe('number');
        expect(typeof stats.supportedVariantsCount).toBe('number');
        expect(typeof stats.totalBuilders).toBe('number');

        expect(stats.exactModelsCount).toBeGreaterThan(0);
        expect(stats.supportedVariantsCount).toBeGreaterThan(0);
        expect(stats.totalBuilders).toBeGreaterThan(0);
      });

      it('should return same result on multiple calls', () => {
        const stats1 = WorkflowRouter.getRoutingStats();
        const stats2 = WorkflowRouter.getRoutingStats();
        expect(stats1).toEqual(stats2);
      });

      it('should have totalBuilders equal to unique builders count', () => {
        const stats = WorkflowRouter.getRoutingStats();

        // Since all 4 builders are unique, totalBuilders should be 4
        expect(stats.totalBuilders).toBe(4);
      });
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    describe('Whitespace Handling', () => {
      it('should treat whitespace-only modelId as invalid', () => {
        const detectionResult: WorkflowDetectionResult = {
          architecture: 'FLUX',
          isSupported: true,
        };

        try {
          WorkflowRouter.routeWorkflow('   ', detectionResult, 'test.safetensors');
          expect.fail('Should have thrown an error');
        } catch (error: any) {
          expect(error).toHaveProperty('errorType', AgentRuntimeErrorType.ComfyUIWorkflowError);
        }
      });

      it('should handle whitespace in variant gracefully', () => {
        const detectionResult: WorkflowDetectionResult = {
          architecture: 'FLUX',
          variant: '  dev  ' as any,
          isSupported: true,
        };

        // Should not match because variant matching is exact
        try {
          WorkflowRouter.routeWorkflow('unknown-model', detectionResult, 'test.safetensors');
          expect.fail('Should have thrown an error');
        } catch (error: any) {
          expect(error).toHaveProperty('errorType', AgentRuntimeErrorType.ComfyUIWorkflowError);
        }
      });
    });

    describe('Parameter Edge Cases', () => {
      it('should handle empty modelFileName', () => {
        const detectionResult: WorkflowDetectionResult = {
          architecture: 'FLUX',
          isSupported: true,
        };

        const result = WorkflowRouter.routeWorkflow(
          'flux-dev',
          detectionResult,
          '', // Empty modelFileName
        );

        expect(buildFluxDevWorkflow).toHaveBeenCalledWith('', {});
        expect(result).toBe(mockPromptBuilder);
      });

      it('should handle null params by passing null through', () => {
        const detectionResult: WorkflowDetectionResult = {
          architecture: 'FLUX',
          isSupported: true,
        };

        const result = WorkflowRouter.routeWorkflow(
          'flux-dev',
          detectionResult,
          'test.safetensors',
          null as any,
        );

        expect(buildFluxDevWorkflow).toHaveBeenCalledWith('test.safetensors', null);
        expect(result).toBe(mockPromptBuilder);
      });

      it('should handle complex params object', () => {
        const detectionResult: WorkflowDetectionResult = {
          architecture: 'FLUX',
          isSupported: true,
        };

        const complexParams = {
          steps: 20,
          guidance: 7.5,
          sampler: 'euler_ancestral',
          scheduler: 'normal',
          cfg_scale: 1.0,
          width: 1024,
          height: 1024,
          seed: 42,
          prompt: 'test prompt',
          negative_prompt: 'bad quality',
          nested: {
            deep: {
              value: true,
            },
          },
        };

        const result = WorkflowRouter.routeWorkflow(
          'flux-dev',
          detectionResult,
          'test.safetensors',
          complexParams,
        );

        expect(buildFluxDevWorkflow).toHaveBeenCalledWith('test.safetensors', complexParams);
        expect(result).toBe(mockPromptBuilder);
      });
    });

    describe('DetectionResult Edge Cases', () => {
      it('should handle minimal detection result', () => {
        const detectionResult: WorkflowDetectionResult = {
          architecture: 'FLUX',
          isSupported: true,
        };

        const result = WorkflowRouter.routeWorkflow(
          'flux-dev',
          detectionResult,
          'test.safetensors',
        );

        expect(result).toBe(mockPromptBuilder);
      });

      it('should handle detection result with all properties', () => {
        const detectionResult: WorkflowDetectionResult = {
          architecture: 'FLUX',
          category: 'model',
          isSupported: true,
          variant: 'dev',
        };

        const result = WorkflowRouter.routeWorkflow(
          'some-flux-model',
          detectionResult,
          'test.safetensors',
        );

        expect(buildFluxDevWorkflow).toHaveBeenCalled();
        expect(result).toBe(mockPromptBuilder);
      });

      it('should handle empty string variant', () => {
        const detectionResult: WorkflowDetectionResult = {
          architecture: 'FLUX',
          variant: '' as any,
          isSupported: true,
        };

        try {
          WorkflowRouter.routeWorkflow('unknown-model', detectionResult, 'test.safetensors');
          expect.fail('Should have thrown an error');
        } catch (error: any) {
          expect(error).toHaveProperty('errorType', AgentRuntimeErrorType.ComfyUIWorkflowError);
          expect(error.error.message).toContain('variant: unknown');
        }
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('should work with realistic FLUX dev detection result', () => {
      const detectionResult: WorkflowDetectionResult = {
        architecture: 'FLUX',
        category: 'model',
        variant: 'dev',
        isSupported: true,
      };

      const result = WorkflowRouter.routeWorkflow(
        'custom-flux-dev-v2',
        detectionResult,
        'custom-flux-dev-v2.safetensors',
        {
          steps: 20,
          guidance: 3.5,
          width: 1024,
          height: 1024,
        },
      );

      expect(buildFluxDevWorkflow).toHaveBeenCalledWith('custom-flux-dev-v2.safetensors', {
        steps: 20,
        guidance: 3.5,
        width: 1024,
        height: 1024,
      });
      expect(result).toBe(mockPromptBuilder);
    });

    it('should work with realistic FLUX schnell detection result', () => {
      const detectionResult: WorkflowDetectionResult = {
        architecture: 'FLUX',
        category: 'model',
        variant: 'schnell',
        isSupported: true,
      };

      const result = WorkflowRouter.routeWorkflow(
        'community-flux-schnell-merge',
        detectionResult,
        'community-flux-schnell-merge.safetensors',
        {
          steps: 4,
          width: 512,
          height: 768,
        },
      );

      expect(buildFluxSchnellWorkflow).toHaveBeenCalledWith(
        'community-flux-schnell-merge.safetensors',
        {
          steps: 4,
          width: 512,
          height: 768,
        },
      );
      expect(result).toBe(mockPromptBuilder);
    });
  });
});
