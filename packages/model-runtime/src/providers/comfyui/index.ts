import type { ComfyUIKeyVault } from '@/types/index';
import debug from 'debug';

import { LobeRuntimeAI } from '../../core/BaseAI';
import { AuthenticatedImageRuntime, CreateImagePayload, CreateImageResponse } from '../../types/image';

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
   * Create image using internal API endpoint
   * Always uses full URL for consistency across environments
   */
  async createImage(payload: CreateImagePayload): Promise<CreateImageResponse> {
    log('🎨 Creating image with model: %s', payload.model);

    try {
      // Always use full URL from APP_URL environment variable
      // This ensures consistency across server and client environments
      const appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3010}`;

      const response = await fetch(`${appUrl}/webapi/text-to-image/comfyui`, {
        body: JSON.stringify({
          model: payload.model,
          options: this.options,
          params: payload.params,
        }),
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`ComfyUI API error: ${response.status} - ${error}`);
      }

      const result = await response.json();
      log('✅ ComfyUI image created successfully');
      return result;
    } catch (error) {
      log('❌ ComfyUI createImage error: %O', error);
      throw error;
    }
  }
}
