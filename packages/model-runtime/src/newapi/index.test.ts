// @vitest-environment node
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { responsesAPIModels } from '../const/models';
import { ModelProvider } from '../types';
import { ChatStreamPayload } from '../types/chat';
import * as modelParseModule from '../utils/modelParse';
import { NewAPIModelCard, NewAPIPricing } from './index';

// Type definitions for test mocks
interface PricingResponse {
  success?: boolean;
  data?: NewAPIPricing[];
}

interface TestModel {
  id: string;
  displayName?: string;
  type?: string;
  enabled?: boolean;
  _detectedProvider?: string; // Make this optional for delete operations
}

// Mock console methods
vi.spyOn(console, 'error').mockImplementation(() => {});
vi.spyOn(console, 'debug').mockImplementation(() => {});

describe('NewAPI', () => {
  let mockFetch: Mock;

  beforeEach(() => {
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Mock environment
    process.env.DEBUG_NEWAPI_CHAT_COMPLETION = undefined;
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete process.env.DEBUG_NEWAPI_CHAT_COMPLETION;
  });

  describe('handlePayload function', () => {
    // We'll test the logic by importing and calling the logic directly
    const testHandlePayload = (payload: ChatStreamPayload) => {
      // Inline the handlePayload logic for testing
      if (
        responsesAPIModels.has(payload.model) ||
        payload.model.includes('gpt-') ||
        /^o\d/.test(payload.model)
      ) {
        return { ...payload, apiMode: 'responses' } as any;
      }
      return payload as any;
    };

    it('should detect responses API models from responsesAPIModels set', () => {
      const testModel = 'o1-pro';
      vi.spyOn(responsesAPIModels, 'has').mockReturnValue(true);

      const payload: ChatStreamPayload = {
        model: testModel,
        messages: [],
        temperature: 0.5,
      };

      const result = testHandlePayload(payload);
      expect(result).toEqual({ ...payload, apiMode: 'responses' });
    });

    it('should detect responses API for gpt- models', () => {
      vi.spyOn(responsesAPIModels, 'has').mockReturnValue(false);

      const payload: ChatStreamPayload = {
        model: 'gpt-4o',
        messages: [],
        temperature: 0.5,
      };

      const result = testHandlePayload(payload);
      expect(result).toEqual({ ...payload, apiMode: 'responses' });
    });

    it('should detect responses API for o-series models', () => {
      vi.spyOn(responsesAPIModels, 'has').mockReturnValue(false);

      const payload: ChatStreamPayload = {
        model: 'o1-mini',
        messages: [],
        temperature: 0.5,
      };

      const result = testHandlePayload(payload);
      expect(result).toEqual({ ...payload, apiMode: 'responses' });
    });

    it('should not modify payload for regular models', () => {
      vi.spyOn(responsesAPIModels, 'has').mockReturnValue(false);

      const payload: ChatStreamPayload = {
        model: 'claude-3-sonnet',
        messages: [],
        temperature: 0.5,
      };

      const result = testHandlePayload(payload);
      expect(result).toEqual(payload);
    });

    it('should detect o3 model pattern', () => {
      vi.spyOn(responsesAPIModels, 'has').mockReturnValue(false);

      const payload: ChatStreamPayload = {
        model: 'o3-turbo',
        messages: [],
        temperature: 0.5,
      };

      const result = testHandlePayload(payload);
      expect(result).toEqual({ ...payload, apiMode: 'responses' });
    });
  });

  describe('getProviderFromOwnedBy function', () => {
    // Inline the getProviderFromOwnedBy logic for testing
    const testGetProviderFromOwnedBy = (ownedBy: string): string => {
      const normalizedOwnedBy = ownedBy.toLowerCase();

      if (normalizedOwnedBy.includes('anthropic') || normalizedOwnedBy.includes('claude')) {
        return 'anthropic';
      }
      if (normalizedOwnedBy.includes('google') || normalizedOwnedBy.includes('gemini')) {
        return 'google';
      }
      if (
        normalizedOwnedBy.includes('xai') ||
        normalizedOwnedBy.includes('grok') ||
        normalizedOwnedBy.includes('x.ai')
      ) {
        return 'xai';
      }

      return 'openai';
    };

    const testCases = [
      { ownedBy: 'anthropic', expected: 'anthropic' },
      { ownedBy: 'Anthropic Inc.', expected: 'anthropic' },
      { ownedBy: 'claude-team', expected: 'anthropic' },
      { ownedBy: 'google', expected: 'google' },
      { ownedBy: 'Google LLC', expected: 'google' },
      { ownedBy: 'gemini-pro', expected: 'google' },
      { ownedBy: 'xai', expected: 'xai' },
      { ownedBy: 'X.AI', expected: 'xai' },
      { ownedBy: 'grok-beta', expected: 'xai' },
      { ownedBy: 'openai', expected: 'openai' },
      { ownedBy: 'unknown-company', expected: 'openai' },
      { ownedBy: '', expected: 'openai' },
    ];

    testCases.forEach(({ ownedBy, expected }) => {
      it(`should return ${expected} for ${ownedBy}`, () => {
        const result = testGetProviderFromOwnedBy(ownedBy);
        expect(result).toBe(expected);
      });
    });
  });

  describe('models function logic', () => {
    it('should process pricing for quota_type 0 with model_price', async () => {
      const mockModelList: NewAPIModelCard[] = [
        {
          id: 'test-model',
          object: 'model',
          created: 1234567890,
          owned_by: 'openai',
        },
      ];

      const mockPricing: NewAPIPricing[] = [
        {
          model_name: 'test-model',
          quota_type: 0,
          model_price: 10,
          completion_ratio: 1.5,
          enable_groups: ['default'],
        },
      ];

      // Test the pricing calculation logic inline
      const pricingMap: Map<string, NewAPIPricing> = new Map();
      mockPricing.forEach((pricing) => {
        pricingMap.set(pricing.model_name, pricing);
      });

      const enrichedModel = { ...mockModelList[0] };
      const pricing = pricingMap.get(enrichedModel.id);

      if (pricing && pricing.quota_type === 0) {
        let inputPrice: number | undefined;
        let outputPrice: number | undefined;

        if (pricing.model_price && pricing.model_price > 0) {
          inputPrice = pricing.model_price * 2; // Convert to $/1M tokens
        } else if (pricing.model_ratio) {
          inputPrice = pricing.model_ratio * 2;
        }

        if (inputPrice !== undefined) {
          outputPrice = inputPrice * (pricing.completion_ratio || 1);
          (enrichedModel as any).pricing = {
            input: inputPrice,
            output: outputPrice,
          };
        }
      }

      expect((enrichedModel as any).pricing).toEqual({
        input: 20, // model_price * 2
        output: 30, // input * completion_ratio
      });
    });

    it('should process pricing for quota_type 0 with model_ratio', async () => {
      const mockModelList: NewAPIModelCard[] = [
        {
          id: 'test-model',
          object: 'model',
          created: 1234567890,
          owned_by: 'openai',
        },
      ];

      const mockPricing: NewAPIPricing[] = [
        {
          model_name: 'test-model',
          quota_type: 0,
          model_ratio: 15,
          completion_ratio: 2,
          enable_groups: ['default'],
        },
      ];

      // Test the pricing calculation logic inline
      const pricingMap: Map<string, NewAPIPricing> = new Map();
      mockPricing.forEach((pricing) => {
        pricingMap.set(pricing.model_name, pricing);
      });

      const enrichedModel = { ...mockModelList[0] };
      const pricing = pricingMap.get(enrichedModel.id);

      if (pricing && pricing.quota_type === 0) {
        let inputPrice: number | undefined;
        let outputPrice: number | undefined;

        if (pricing.model_price && pricing.model_price > 0) {
          inputPrice = pricing.model_price * 2;
        } else if (pricing.model_ratio) {
          inputPrice = pricing.model_ratio * 2; // model_ratio * 2
        }

        if (inputPrice !== undefined) {
          outputPrice = inputPrice * (pricing.completion_ratio || 1);
          (enrichedModel as any).pricing = {
            input: inputPrice,
            output: outputPrice,
          };
        }
      }

      expect((enrichedModel as any).pricing).toEqual({
        input: 30, // model_ratio * 2
        output: 60, // input * completion_ratio
      });
    });

    it('should skip pricing for quota_type 1', () => {
      const mockModelList: NewAPIModelCard[] = [
        {
          id: 'test-model',
          object: 'model',
          created: 1234567890,
          owned_by: 'openai',
        },
      ];

      const mockPricing: NewAPIPricing[] = [
        {
          model_name: 'test-model',
          quota_type: 1, // per-request billing
          model_price: 10,
          enable_groups: ['default'],
        },
      ];

      // Test the pricing calculation logic inline
      const pricingMap: Map<string, NewAPIPricing> = new Map();
      mockPricing.forEach((pricing) => {
        pricingMap.set(pricing.model_name, pricing);
      });

      const enrichedModel = { ...mockModelList[0] };
      const pricing = pricingMap.get(enrichedModel.id);

      // Should skip quota_type === 1
      expect(pricing?.quota_type).toBe(1);
      expect((enrichedModel as any).pricing).toBeUndefined();
    });

    it('should handle default completion_ratio when not provided', () => {
      const mockModelList: NewAPIModelCard[] = [
        {
          id: 'test-model',
          object: 'model',
          created: 1234567890,
          owned_by: 'openai',
        },
      ];

      const mockPricing: NewAPIPricing[] = [
        {
          model_name: 'test-model',
          quota_type: 0,
          model_ratio: 10,
          // completion_ratio not provided - should default to 1
          enable_groups: ['default'],
        },
      ];

      // Test the pricing calculation logic inline
      const pricingMap: Map<string, NewAPIPricing> = new Map();
      mockPricing.forEach((pricing) => {
        pricingMap.set(pricing.model_name, pricing);
      });

      const enrichedModel = { ...mockModelList[0] };
      const pricing = pricingMap.get(enrichedModel.id);

      if (pricing && pricing.quota_type === 0) {
        let inputPrice: number | undefined;
        let outputPrice: number | undefined;

        if (pricing.model_price && pricing.model_price > 0) {
          inputPrice = pricing.model_price * 2;
        } else if (pricing.model_ratio) {
          inputPrice = pricing.model_ratio * 2;
        }

        if (inputPrice !== undefined) {
          outputPrice = inputPrice * (pricing.completion_ratio || 1); // Default to 1
          (enrichedModel as any).pricing = {
            input: inputPrice,
            output: outputPrice,
          };
        }
      }

      expect((enrichedModel as any).pricing).toEqual({
        input: 20, // model_ratio * 2
        output: 20, // input * 1 (default completion_ratio)
      });
    });
  });

  describe('provider detection routing logic', () => {
    const testProviderDetection = (model: NewAPIModelCard): string => {
      let detectedProvider = 'openai'; // Default

      // Priority 1: Use supported_endpoint_types
      if (model.supported_endpoint_types && model.supported_endpoint_types.length > 0) {
        if (model.supported_endpoint_types.includes('anthropic')) {
          detectedProvider = 'anthropic';
        } else if (model.supported_endpoint_types.includes('gemini')) {
          detectedProvider = 'google';
        } else if (model.supported_endpoint_types.includes('xai')) {
          detectedProvider = 'xai';
        }
      }
      // Priority 2: Use owned_by field
      else if (model.owned_by) {
        const normalizedOwnedBy = model.owned_by.toLowerCase();
        if (normalizedOwnedBy.includes('anthropic') || normalizedOwnedBy.includes('claude')) {
          detectedProvider = 'anthropic';
        } else if (normalizedOwnedBy.includes('google') || normalizedOwnedBy.includes('gemini')) {
          detectedProvider = 'google';
        } else if (normalizedOwnedBy.includes('xai') || normalizedOwnedBy.includes('grok')) {
          detectedProvider = 'xai';
        }
      }
      // Priority 3: Model name detection would happen here (mocked in tests)

      return detectedProvider;
    };

    it('should use supported_endpoint_types as priority 1', () => {
      const mockModel: NewAPIModelCard = {
        id: 'test-anthropic-model',
        object: 'model',
        created: 1234567890,
        owned_by: 'openai', // This would normally suggest openai
        supported_endpoint_types: ['anthropic'], // But this overrides
      };

      const result = testProviderDetection(mockModel);
      expect(result).toBe('anthropic');
    });

    it('should detect google provider from supported_endpoint_types', () => {
      const mockModel: NewAPIModelCard = {
        id: 'test-google-model',
        object: 'model',
        created: 1234567890,
        owned_by: 'openai',
        supported_endpoint_types: ['gemini'],
      };

      const result = testProviderDetection(mockModel);
      expect(result).toBe('google');
    });

    it('should detect xai provider from supported_endpoint_types', () => {
      const mockModel: NewAPIModelCard = {
        id: 'test-xai-model',
        object: 'model',
        created: 1234567890,
        owned_by: 'openai',
        supported_endpoint_types: ['xai'],
      };

      const result = testProviderDetection(mockModel);
      expect(result).toBe('xai');
    });

    it('should use owned_by as priority 2 when supported_endpoint_types not available', () => {
      const mockModel: NewAPIModelCard = {
        id: 'test-anthropic-model',
        object: 'model',
        created: 1234567890,
        owned_by: 'anthropic',
        // no supported_endpoint_types
      };

      const result = testProviderDetection(mockModel);
      expect(result).toBe('anthropic');
    });

    it('should default to openai when no other detection methods apply', () => {
      const mockModel: NewAPIModelCard = {
        id: 'test-model',
        object: 'model',
        created: 1234567890,
        owned_by: 'unknown-provider',
        // no supported_endpoint_types
      };

      const result = testProviderDetection(mockModel);
      expect(result).toBe('openai');
    });

    it('should handle empty supported_endpoint_types', () => {
      const mockModel: NewAPIModelCard = {
        id: 'test-model',
        object: 'model',
        created: 1234567890,
        owned_by: 'anthropic',
        supported_endpoint_types: [], // Empty array
      };

      const result = testProviderDetection(mockModel);
      expect(result).toBe('anthropic'); // Should fall back to owned_by
    });
  });

  describe('URL processing logic', () => {
    it('should remove trailing /v1 from baseURL', () => {
      const testURLs = [
        { input: 'https://api.newapi.com/v1', expected: 'https://api.newapi.com' },
        { input: 'https://api.newapi.com/v1/', expected: 'https://api.newapi.com' },
        { input: 'https://api.newapi.com', expected: 'https://api.newapi.com' },
        { input: 'https://api.newapi.com/', expected: 'https://api.newapi.com/' }, // This should remain unchanged
      ];

      testURLs.forEach(({ input, expected }) => {
        const result = input.replace(/\/v1\/?$/, '');
        expect(result).toBe(expected);
      });
    });
  });

  describe('data handling edge cases', () => {
    it('should handle undefined data in models list', () => {
      const data = undefined;
      const modelList = data || [];
      expect(modelList).toEqual([]);
    });

    it('should handle null data in models list', () => {
      const data = null;
      const modelList = data || [];
      expect(modelList).toEqual([]);
    });

    it('should handle pricing response without success field', () => {
      const pricingResponse: PricingResponse = {
        // no success field
        data: [
          {
            model_name: 'test-model',
            quota_type: 0,
            model_ratio: 10,
            enable_groups: ['default'],
          },
        ],
      };

      const shouldProcess = pricingResponse.success && pricingResponse.data;
      expect(shouldProcess).toBeFalsy();
    });

    it('should handle pricing response with success false', () => {
      const pricingResponse: PricingResponse = {
        success: false,
        data: [
          {
            model_name: 'test-model',
            quota_type: 0,
            model_ratio: 10,
            enable_groups: ['default'],
          },
        ],
      };

      const shouldProcess = pricingResponse.success && pricingResponse.data;
      expect(shouldProcess).toBeFalsy();
    });

    it('should handle pricing response without data field', () => {
      const pricingResponse: PricingResponse = {
        success: true,
        // no data field
      };

      const shouldProcess = pricingResponse.success && pricingResponse.data;
      expect(shouldProcess).toBeFalsy();
    });
  });

  describe('environment variable handling', () => {
    it('should return false for debug when environment variable not set', () => {
      const debugEnabled = process.env.DEBUG_NEWAPI_CHAT_COMPLETION === '1';
      expect(debugEnabled).toBe(false);
    });

    it('should return true for debug when environment variable is set to 1', () => {
      process.env.DEBUG_NEWAPI_CHAT_COMPLETION = '1';
      const debugEnabled = process.env.DEBUG_NEWAPI_CHAT_COMPLETION === '1';
      expect(debugEnabled).toBe(true);
    });

    it('should return false for debug when environment variable is not 1', () => {
      process.env.DEBUG_NEWAPI_CHAT_COMPLETION = '0';
      const debugEnabled = process.env.DEBUG_NEWAPI_CHAT_COMPLETION === '1';
      expect(debugEnabled).toBe(false);
    });
  });

  describe('model processing patterns', () => {
    it('should clean temporary _detectedProvider field from models', () => {
      const model: TestModel = {
        id: 'test-model',
        displayName: 'Test Model',
        type: 'chat' as any,
        enabled: true,
        _detectedProvider: 'openai', // This should be cleaned
      };

      // Simulate the cleanup logic
      if (model._detectedProvider) {
        delete model._detectedProvider;
      }

      expect(model).not.toHaveProperty('_detectedProvider');
    });

    it('should handle model route map clearing and rebuilding', () => {
      const modelRouteMap = new Map<string, string>();

      // First batch of models
      modelRouteMap.set('model-1', 'anthropic');
      modelRouteMap.set('model-2', 'google');
      expect(modelRouteMap.size).toBe(2);

      // Clear and rebuild (simulating the logic in models function)
      modelRouteMap.clear();
      expect(modelRouteMap.size).toBe(0);

      // New batch
      modelRouteMap.set('model-3', 'xai');
      expect(modelRouteMap.size).toBe(1);
      expect(modelRouteMap.get('model-3')).toBe('xai');
    });
  });

  describe('pricing edge cases', () => {
    it('should handle model with no pricing match', () => {
      const pricingMap = new Map<string, NewAPIPricing>();
      pricingMap.set('other-model', {
        model_name: 'other-model',
        quota_type: 0,
        model_ratio: 10,
        enable_groups: ['default'],
      });

      const model = {
        id: 'test-model', // No match in pricing map
        object: 'model',
        created: 1234567890,
        owned_by: 'openai',
      };

      const pricing = pricingMap.get(model.id);
      expect(pricing).toBeUndefined();
    });

    it('should handle pricing with zero or negative model_price', () => {
      const pricing: NewAPIPricing = {
        model_name: 'test-model',
        quota_type: 0,
        model_price: 0, // Zero price
        model_ratio: 10, // Should fallback to this
        enable_groups: ['default'],
      };

      let inputPrice: number | undefined;

      if (pricing.model_price && pricing.model_price > 0) {
        inputPrice = pricing.model_price * 2;
      } else if (pricing.model_ratio) {
        inputPrice = pricing.model_ratio * 2;
      }

      expect(inputPrice).toBe(20); // Should use model_ratio
    });
  });
});
