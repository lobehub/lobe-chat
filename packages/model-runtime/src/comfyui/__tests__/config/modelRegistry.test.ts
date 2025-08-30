import { describe, expect, it } from 'vitest';

import { MODEL_REGISTRY } from '../../config/modelRegistry';
import {
  getAllModelNames,
  getModelConfig,
  getModelsByVariant,
} from '../../utils/staticModelLookup';

describe('ModelRegistry', () => {
  describe('MODEL_REGISTRY', () => {
    it('should be a non-empty object with valid structure', () => {
      expect(typeof MODEL_REGISTRY).toBe('object');
      expect(Object.keys(MODEL_REGISTRY).length).toBeGreaterThan(0);

      // Check that all models have required fields
      Object.entries(MODEL_REGISTRY).forEach(([, config]) => {
        expect(config).toBeDefined();
        expect(config.modelFamily).toBeDefined();
        expect(config.priority).toBeTypeOf('number');
        if (config.recommendedDtype) {
          expect(
            ['default', 'fp8_e4m3fn', 'fp8_e4m3fn_fast', 'fp8_e5m2'].includes(
              config.recommendedDtype,
            ),
          ).toBe(true);
        }
      });
    });

    it('should contain essential model families', () => {
      const modelFamilies = Object.values(MODEL_REGISTRY).map((c) => c.modelFamily);
      const uniqueFamilies = [...new Set(modelFamilies)];

      expect(uniqueFamilies).toContain('FLUX');
    });

    it('should have valid priority ranges', () => {
      Object.entries(MODEL_REGISTRY).forEach(([, config]) => {
        // Priorities should be positive numbers
        expect(config.priority).toBeGreaterThan(0);
        expect(config.priority).toBeLessThanOrEqual(10);
      });
    });
  });

  describe('getModelConfig', () => {
    it('should return model config for valid name', () => {
      const config = getModelConfig('flux1-dev.safetensors');
      expect(config).toBeDefined();
      expect(config?.modelFamily).toBe('FLUX');
    });

    it('should return undefined for invalid name', () => {
      const config = getModelConfig('nonexistent.safetensors');
      expect(config).toBeUndefined();
    });
  });

  describe('getAllModelNames', () => {
    it('should return all model names', () => {
      const names = getAllModelNames();
      expect(names.length).toBeGreaterThan(0);
      expect(names).toContain('flux1-dev.safetensors');
    });

    it('should return unique names', () => {
      const names = getAllModelNames();
      const uniqueNames = [...new Set(names)];
      expect(uniqueNames.length).toBe(names.length);
    });
  });

  describe('getModelsByVariant', () => {
    it('should return model names for valid variant', () => {
      const modelNames = getModelsByVariant('dev');
      expect(modelNames.length).toBeGreaterThan(0);
      expect(Array.isArray(modelNames)).toBe(true);

      // Verify all returned names are strings and correspond to dev variant models
      modelNames.forEach((name) => {
        expect(typeof name).toBe('string');
        const config = getModelConfig(name);
        expect(config).toBeDefined();
        expect(config?.variant).toBe('dev');
      });
    });

    it('should return models sorted by priority', () => {
      const modelNames = getModelsByVariant('dev');
      expect(modelNames.length).toBeGreaterThan(1);

      // Verify priority sorting (lower priority number = higher priority)
      for (let i = 0; i < modelNames.length - 1; i++) {
        const config1 = getModelConfig(modelNames[i]);
        const config2 = getModelConfig(modelNames[i + 1]);
        expect(config1?.priority).toBeLessThanOrEqual(config2?.priority || 0);
      }
    });

    it('should return empty array for invalid variant', () => {
      const models = getModelsByVariant('nonexistent' as any);
      expect(models).toEqual([]);
    });
  });

  describe('getModelConfig with options', () => {
    it('should support case-insensitive lookup', () => {
      // 使用真实的 FLUX 模型测试大小写不敏感查找
      const config = getModelConfig('FLUX1-DEV.SAFETENSORS', { caseInsensitive: true });
      expect(config).toBeDefined();
      expect(config?.modelFamily).toBe('FLUX');
      expect(config?.variant).toBe('dev');

      // 测试其他大小写变体
      const config2 = getModelConfig('flux1-DEV.safetensors', { caseInsensitive: true });
      expect(config2).toBeDefined();
      expect(config2?.modelFamily).toBe('FLUX');
    });

    it('should return undefined for non-matching case without caseInsensitive option', () => {
      const config = getModelConfig('FLUX1-DEV.SAFETENSORS');
      expect(config).toBeUndefined();
    });

    it('should filter by variant', () => {
      // 测试匹配的 variant
      const config = getModelConfig('flux1-dev.safetensors', { variant: 'dev' });
      expect(config).toBeDefined();
      expect(config?.variant).toBe('dev');

      // 测试不匹配的 variant
      const nonMatchingConfig = getModelConfig('flux1-dev.safetensors', { variant: 'schnell' });
      expect(nonMatchingConfig).toBeUndefined();
    });

    it('should filter by modelFamily', () => {
      // 测试 SD3.5 模型家族
      const config = getModelConfig('sd3.5_large.safetensors', { modelFamily: 'SD3' });
      expect(config).toBeDefined();
      expect(config?.modelFamily).toBe('SD3');

      // 测试不匹配的 modelFamily
      const nonMatchingConfig = getModelConfig('sd3.5_large.safetensors', { modelFamily: 'FLUX' });
      expect(nonMatchingConfig).toBeUndefined();
    });

    it('should filter by priority', () => {
      // FLUX 模型 priority 为 1
      const config = getModelConfig('flux1-dev.safetensors', { priority: 1 });
      expect(config).toBeDefined();

      // 测试不存在的 priority
      const nonMatchingConfig = getModelConfig('flux1-dev.safetensors', { priority: 5 });
      expect(nonMatchingConfig).toBeUndefined();
    });

    it('should filter by recommendedDtype', () => {
      // flux_shakker_labs_union_pro-fp8_e4m3fn 有 fp8_e4m3fn
      const config = getModelConfig('flux_shakker_labs_union_pro-fp8_e4m3fn.safetensors', {
        recommendedDtype: 'fp8_e4m3fn',
      });
      expect(config).toBeDefined();
      expect(config?.recommendedDtype).toBe('fp8_e4m3fn');

      // 测试不匹配的 recommendedDtype
      const nonMatchingConfig = getModelConfig(
        'flux_shakker_labs_union_pro-fp8_e4m3fn.safetensors',
        { recommendedDtype: 'default' },
      );
      expect(nonMatchingConfig).toBeUndefined();
    });

    it('should combine multiple filters', () => {
      // 所有过滤条件都匹配
      const config = getModelConfig('flux1-dev.safetensors', {
        modelFamily: 'FLUX',
        priority: 1,
        variant: 'dev',
      });
      expect(config).toBeDefined();

      // 其中一个过滤条件不匹配
      const nonMatchingConfig = getModelConfig('flux1-dev.safetensors', {
        modelFamily: 'FLUX',
        priority: 5,
        variant: 'dev', // 错误的 priority
      });
      expect(nonMatchingConfig).toBeUndefined();
    });

    it('should handle case-insensitive with other filters', () => {
      const config = getModelConfig('FLUX1-DEV.safetensors', {
        caseInsensitive: true,
        modelFamily: 'FLUX',
        variant: 'dev',
      });
      expect(config).toBeDefined();
    });
  });
});
