import type { ComfyUIKeyVault } from '@lobechat/types';
import debug from 'debug';

import { LobeRuntimeAI } from '../BaseAI';
import { AuthenticatedImageRuntime, CreateImagePayload, CreateImageResponse } from '../types/image';

const log = debug('lobe-image:comfyui');

/**
 * ComfyUI Runtime implementation
 * Supports text-to-image and image editing
 */
export class LobeComfyUI implements LobeRuntimeAI, AuthenticatedImageRuntime {
  private options: ComfyUIKeyVault;
  baseURL: string;

  constructor(options: ComfyUIKeyVault = {}) {
    log('🏗️ ComfyUI Runtime initialized');

    this.options = options;
    this.baseURL = options.baseURL || process.env.COMFYUI_DEFAULT_URL || 'http://localhost:8188';

    log('✅ ComfyUI Runtime ready - baseURL: %s', this.baseURL);
  }

  /**
   * Get authentication headers for image download
   * Used by framework for authenticated image downloads
   */
  getAuthHeaders(): Record<string, string> | undefined {
    log('🔐 Providing auth headers for image download');

    const { authType = 'none', apiKey, username, password, customHeaders } = this.options;

    switch (authType) {
      case 'basic': {
        if (username && password) {
          return { Authorization: `Basic ${btoa(`${username}:${password}`)}` };
        }
        return undefined;
      }

      case 'bearer': {
        if (apiKey) {
          return { Authorization: `Bearer ${apiKey}` };
        }
        return undefined;
      }

      case 'custom': {
        return customHeaders || undefined;
      }

      case 'none': {
        return undefined;
      }
    }
  }

  /**
   * Create image using tRPC to Framework services
   */
  async createImage(payload: CreateImagePayload): Promise<CreateImageResponse> {
    log('🎨 Creating image with model: %s', payload.model);

    try {
      // Use tRPC caller to invoke Framework services (Edge Runtime compatible)
      const { createCallerFactory } = await import('@/libs/trpc/lambda');
      const { lambdaRouter } = await import('@/server/routers/lambda');

      // The tRPC router handles authentication through keyVaults middleware
      const createCaller = createCallerFactory(lambdaRouter);
      const caller = createCaller({});

      // Call Framework services through tRPC
      const result = await caller.comfyui.createImage({
        model: payload.model,
        options: this.options,
        params: payload.params,
      });

      return result;
    } catch (error) {
      log('❌ ComfyUI createImage error: %O', error);
      throw error;
    }
  }
}
