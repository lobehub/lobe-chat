// @vitest-environment node
import type { ComfyUIKeyVault } from '@lobechat/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { CreateImagePayload } from '../../types/image';
import { LobeComfyUI } from '../index';

// Mock debug
vi.mock('debug', () => ({
  default: vi.fn(() => vi.fn()),
}));

// Mock Framework services
const mockImageService = {
  createImage: vi.fn(),
};

const mockServices = {
  ComfyUIClientService: vi.fn().mockImplementation(() => ({})),
  ModelResolverService: vi.fn().mockImplementation(() => ({})),
  WorkflowBuilderService: vi.fn().mockImplementation(() => ({})),
  ImageService: vi.fn().mockImplementation(() => mockImageService),
};

// Mock dynamic imports
vi.mock('@/server/services/comfyui/core/comfyUIClientService', () => ({
  ComfyUIClientService: mockServices.ComfyUIClientService,
}));

vi.mock('@/server/services/comfyui/core/modelResolverService', () => ({
  ModelResolverService: mockServices.ModelResolverService,
}));

vi.mock('@/server/services/comfyui/core/workflowBuilderService', () => ({
  WorkflowBuilderService: mockServices.WorkflowBuilderService,
}));

vi.mock('@/server/services/comfyui/core/imageService', () => ({
  ImageService: mockServices.ImageService,
}));

describe('LobeComfyUI Runtime', () => {
  let runtime: LobeComfyUI;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default options', () => {
      runtime = new LobeComfyUI();

      expect(runtime.baseURL).toBe('http://localhost:8188');
    });

    it('should initialize with custom baseURL', () => {
      const options: ComfyUIKeyVault = {
        baseURL: 'https://custom.comfyui.com',
      };

      runtime = new LobeComfyUI(options);

      expect(runtime.baseURL).toBe('https://custom.comfyui.com');
    });

    it('should use environment variable if no baseURL provided', () => {
      const originalEnv = process.env.COMFYUI_DEFAULT_URL;
      process.env.COMFYUI_DEFAULT_URL = 'https://env.comfyui.com';

      runtime = new LobeComfyUI();

      expect(runtime.baseURL).toBe('https://env.comfyui.com');

      // Restore environment
      if (originalEnv === undefined) {
        delete process.env.COMFYUI_DEFAULT_URL;
      } else {
        process.env.COMFYUI_DEFAULT_URL = originalEnv;
      }
    });
  });

  describe('getAuthHeaders', () => {
    it('should return undefined for no auth', () => {
      runtime = new LobeComfyUI({ authType: 'none' });

      const headers = runtime.getAuthHeaders();

      expect(headers).toBeUndefined();
    });

    it('should return undefined for default auth type', () => {
      runtime = new LobeComfyUI();

      const headers = runtime.getAuthHeaders();

      expect(headers).toBeUndefined();
    });

    it('should return Basic auth headers when configured correctly', () => {
      const options: ComfyUIKeyVault = {
        authType: 'basic',
        username: 'testuser',
        password: 'testpass',
      };

      runtime = new LobeComfyUI(options);

      const headers = runtime.getAuthHeaders();

      expect(headers).toEqual({
        Authorization: `Basic ${btoa('testuser:testpass')}`,
      });
    });

    it('should return undefined for basic auth without credentials', () => {
      const options: ComfyUIKeyVault = {
        authType: 'basic',
      };

      runtime = new LobeComfyUI(options);

      const headers = runtime.getAuthHeaders();

      expect(headers).toBeUndefined();
    });

    it('should return Bearer auth headers when configured correctly', () => {
      const options: ComfyUIKeyVault = {
        authType: 'bearer',
        apiKey: 'test-api-key',
      };

      runtime = new LobeComfyUI(options);

      const headers = runtime.getAuthHeaders();

      expect(headers).toEqual({
        Authorization: 'Bearer test-api-key',
      });
    });

    it('should return undefined for bearer auth without apiKey', () => {
      const options: ComfyUIKeyVault = {
        authType: 'bearer',
      };

      runtime = new LobeComfyUI(options);

      const headers = runtime.getAuthHeaders();

      expect(headers).toBeUndefined();
    });

    it('should return custom headers when configured', () => {
      const customHeaders = {
        'X-Custom-Auth': 'custom-value',
        'Authorization': 'Custom auth-token',
      };

      const options: ComfyUIKeyVault = {
        authType: 'custom',
        customHeaders,
      };

      runtime = new LobeComfyUI(options);

      const headers = runtime.getAuthHeaders();

      expect(headers).toEqual(customHeaders);
    });

    it('should return undefined for custom auth without headers', () => {
      const options: ComfyUIKeyVault = {
        authType: 'custom',
      };

      runtime = new LobeComfyUI(options);

      const headers = runtime.getAuthHeaders();

      expect(headers).toBeUndefined();
    });
  });

  describe('createImage', () => {
    beforeEach(() => {
      runtime = new LobeComfyUI({
        baseURL: 'https://test.comfyui.com',
        authType: 'bearer',
        apiKey: 'test-key',
      });
    });

    it('should integrate Framework services and create image successfully', async () => {
      const mockPayload: CreateImagePayload = {
        model: 'flux1-dev.safetensors',
        params: {
          prompt: 'a beautiful landscape',
          width: 1024,
          height: 1024,
          steps: 20,
          cfg: 7,
        },
      };

      const mockResponse = {
        images: [
          {
            url: 'https://test.comfyui.com/image/output.png',
            width: 1024,
            height: 1024,
          },
        ],
      };

      mockImageService.createImage.mockResolvedValue(mockResponse);

      const result = await runtime.createImage(mockPayload);

      expect(result).toEqual(mockResponse);

      // Verify Framework services were initialized correctly
      expect(mockServices.ComfyUIClientService).toHaveBeenCalledWith({
        baseURL: 'https://test.comfyui.com',
        authType: 'bearer',
        apiKey: 'test-key',
      });

      expect(mockServices.ModelResolverService).toHaveBeenCalledWith(
        expect.any(Object), // clientService instance
      );

      expect(mockServices.WorkflowBuilderService).toHaveBeenCalledWith({
        clientService: expect.any(Object),
        modelResolverService: expect.any(Object),
      });

      expect(mockServices.ImageService).toHaveBeenCalledWith(
        expect.any(Object), // clientService
        expect.any(Object), // modelResolverService
        expect.any(Object), // workflowBuilderService
      );

      // Verify imageService.createImage was called with correct payload
      expect(mockImageService.createImage).toHaveBeenCalledWith({
        model: 'flux1-dev.safetensors',
        params: {
          prompt: 'a beautiful landscape',
          width: 1024,
          height: 1024,
          steps: 20,
          cfg: 7,
        },
      });
    });

    it('should handle Framework service errors correctly', async () => {
      const mockPayload: CreateImagePayload = {
        model: 'flux1-dev.safetensors',
        params: {
          prompt: 'test prompt',
        },
      };

      const mockError = new Error('Framework service failed');
      mockImageService.createImage.mockRejectedValue(mockError);

      await expect(runtime.createImage(mockPayload)).rejects.toThrow('Framework service failed');

      expect(mockImageService.createImage).toHaveBeenCalledWith({
        model: 'flux1-dev.safetensors',
        params: {
          prompt: 'test prompt',
        },
      });
    });

    it('should pass all configuration options to Framework services', async () => {
      const complexOptions: ComfyUIKeyVault = {
        baseURL: 'https://complex.comfyui.com:8188',
        authType: 'custom',
        customHeaders: {
          'X-API-Key': 'complex-key',
          'X-Custom-Header': 'custom-value',
        },
      };

      runtime = new LobeComfyUI(complexOptions);

      const mockPayload: CreateImagePayload = {
        model: 'sd3.5-large.safetensors',
        params: {
          prompt: 'complex image generation',
          width: 1152,
          height: 896,
        },
      };

      mockImageService.createImage.mockResolvedValue({ images: [] });

      await runtime.createImage(mockPayload);

      // Verify complex options are passed to Framework services
      expect(mockServices.ComfyUIClientService).toHaveBeenCalledWith(complexOptions);
    });
  });

  describe('runtime interface compliance', () => {
    it('should implement LobeRuntimeAI interface', () => {
      runtime = new LobeComfyUI();

      expect(runtime).toHaveProperty('baseURL');
      expect(typeof runtime.createImage).toBe('function');
    });

    it('should implement AuthenticatedImageRuntime interface', () => {
      runtime = new LobeComfyUI();

      expect(typeof runtime.getAuthHeaders).toBe('function');
    });
  });
});
