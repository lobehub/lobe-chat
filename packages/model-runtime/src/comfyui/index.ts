import type { ComfyUIKeyVault } from '@lobechat/types';
import debug from 'debug';

import { LobeRuntimeAI } from '../BaseAI';
import { AuthenticatedImageRuntime, CreateImagePayload, CreateImageResponse } from '../types/image';
import { COMFYUI_DEFAULTS } from './constants';
import { ComfyUIClientService } from './services/comfyuiClient';
import { ImageService } from './services/imageService';
import { ModelResolverService } from './services/modelResolver';
import { WorkflowBuilderService, WorkflowContext } from './services/workflowBuilder';

const log = debug('lobe-image:comfyui');

/**
 * ComfyUI Runtime implementation
 * Supports text-to-image and image editing
 */
export class LobeComfyUI implements LobeRuntimeAI, AuthenticatedImageRuntime {
  private imageService: ImageService;
  private clientService: ComfyUIClientService;
  private options: ComfyUIKeyVault;

  baseURL: string;

  constructor(options: ComfyUIKeyVault = {}) {
    log('🏗️ ComfyUI Constructor called with options:', {
      authType: options.authType,
      baseURL: options.baseURL,
    });

    this.options = options;
    this.baseURL = options.baseURL || process.env.COMFYUI_DEFAULT_URL || COMFYUI_DEFAULTS.BASE_URL;

    // Initialize services
    this.clientService = new ComfyUIClientService(options);
    const modelResolverService = new ModelResolverService(this.clientService);

    // Create workflow context
    const context: WorkflowContext = {
      clientService: this.clientService,
      modelResolverService: modelResolverService,
    };

    const workflowBuilderService = new WorkflowBuilderService(context);

    // Initialize image service with all dependencies
    this.imageService = new ImageService(
      this.clientService,
      modelResolverService,
      workflowBuilderService,
    );
  }

  /**
   * Get authentication headers for image download
   * This method provides auth headers to framework layer without exposing credentials
   * @returns Authentication headers object, or undefined if no auth is configured
   */
  getAuthHeaders(): Record<string, string> | undefined {
    // Delegate to clientService which manages authentication
    return this.clientService.getAuthHeaders();
  }

  /**
   * Create image
   * Entry point that delegates all business logic to ImageService
   */
  async createImage(payload: CreateImagePayload): Promise<CreateImageResponse> {
    // All logic including connection validation delegated to ImageService
    return this.imageService.createImage(payload);
  }
}
