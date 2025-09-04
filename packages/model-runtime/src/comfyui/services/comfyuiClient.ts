/**
 * ComfyUI Client Service
 *
 * Central service layer for all ComfyUI SDK interactions
 * Provides unified error handling and abstraction over SDK
 */
import { CallWrapper, ComfyApi, PromptBuilder } from '@saintno/comfyui-sdk';
import type {
  BasicCredentials,
  BearerTokenCredentials,
  CustomCredentials,
} from '@saintno/comfyui-sdk';
import debug from 'debug';

import type { ComfyUIKeyVault } from '../../../../types/src/user/settings/keyVaults';
import { COMFYUI_DEFAULTS } from '../constants';
import { ServicesError } from '../errors';
import { TTLCacheManager } from '../utils/cacheManager';
import { ErrorHandlerService } from './errorHandler';

const log = debug('lobe-image:comfyui:client');

/**
 * Authentication Manager
 * Handles all authentication-related logic
 */
class AuthManager {
  private credentials: BasicCredentials | BearerTokenCredentials | CustomCredentials | undefined;
  private authHeaders: Record<string, string> | undefined;

  constructor(options: ComfyUIKeyVault) {
    this.validateOptions(options);
    this.credentials = this.createCredentials(options);
    this.authHeaders = this.createAuthHeaders(options);
  }

  /**
   * Get credentials for SDK
   */
  getCredentials(): typeof this.credentials {
    return this.credentials;
  }

  /**
   * Get authentication headers for HTTP requests
   */
  getAuthHeaders(): Record<string, string> | undefined {
    return this.authHeaders;
  }

  private validateOptions(options: ComfyUIKeyVault): void {
    const { authType = 'none', apiKey, username, password, customHeaders } = options;

    if (authType === 'basic' && (!username || !password)) {
      throw new ServicesError(
        'Basic authentication requires username and password',
        ServicesError.Reasons.INVALID_ARGS,
        { authType },
      );
    }

    if (authType === 'bearer' && !apiKey) {
      throw new ServicesError(
        'Bearer token authentication requires API key',
        ServicesError.Reasons.INVALID_AUTH,
        { authType },
      );
    }

    if (authType === 'custom' && (!customHeaders || Object.keys(customHeaders).length === 0)) {
      throw new ServicesError(
        'Custom authentication requires custom headers',
        ServicesError.Reasons.INVALID_ARGS,
        { authType },
      );
    }
  }

  private createCredentials(options: ComfyUIKeyVault): typeof this.credentials {
    const { authType = 'none', apiKey, username, password, customHeaders } = options;

    switch (authType) {
      case 'basic': {
        return {
          password: password!,
          type: 'basic',
          username: username!,
        } as BasicCredentials;
      }

      case 'bearer': {
        return {
          token: apiKey!,
          type: 'bearer_token',
        } as BearerTokenCredentials;
      }

      case 'custom': {
        return {
          headers: customHeaders!,
          type: 'custom',
        } as CustomCredentials;
      }

      default: {
        return undefined;
      }
    }
  }

  private createAuthHeaders(options: ComfyUIKeyVault): Record<string, string> | undefined {
    const { authType = 'none', apiKey, username, password, customHeaders } = options;

    switch (authType) {
      case 'basic': {
        if (username && password) {
          const basicAuth = btoa(`${username}:${password}`);
          return { Authorization: `Basic ${basicAuth}` };
        }
        break;
      }

      case 'bearer': {
        if (apiKey) {
          return { Authorization: `Bearer ${apiKey}` };
        }
        break;
      }

      case 'custom': {
        return customHeaders;
      }
    }

    return undefined;
  }
}

/**
 * Connection Manager
 * Handles connection validation and state management
 */
class ConnectionManager {
  private validated: boolean = false;
  private lastValidationTime: number = 0;
  private readonly validationTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Check if connection is validated and not expired
   */
  isValidated(): boolean {
    if (!this.validated) return false;

    const now = Date.now();
    if (now - this.lastValidationTime > this.validationTTL) {
      this.validated = false;
      return false;
    }

    return true;
  }

  /**
   * Mark connection as validated
   */
  markAsValidated(): void {
    this.validated = true;
    this.lastValidationTime = Date.now();
  }

  /**
   * Invalidate connection
   */
  invalidate(): void {
    this.validated = false;
  }
}

/**
 * Workflow execution result
 */
export interface WorkflowResult {
  // Raw output data from workflow execution, keyed by node ID
  _raw?: Record<string, any>;
  images?: {
    images?: Array<{
      data: string;
      height?: number;
      mimeType: string;
      width?: number;
    }>;
  };
}

/**
 * Progress callback type
 */
export type ProgressCallback = (info: any) => void;

/**
 * ComfyUI Client Service
 * Encapsulates all SDK interactions
 */
export class ComfyUIClientService {
  private client: ComfyApi;
  private baseURL: string;

  // Use helper classes instead of scattered state
  private cacheManager: TTLCacheManager;
  private authManager: AuthManager;
  private connectionManager: ConnectionManager;
  private errorHandler: ErrorHandlerService;

  constructor(options: ComfyUIKeyVault = {}) {
    this.errorHandler = new ErrorHandlerService();

    try {
      // Initialize helper classes
      this.authManager = new AuthManager(options);
      this.cacheManager = new TTLCacheManager(60_000); // 1 minute TTL
      this.connectionManager = new ConnectionManager();

      // Setup base URL
      this.baseURL =
        options.baseURL || process.env.COMFYUI_DEFAULT_URL || COMFYUI_DEFAULTS.BASE_URL;

      // Initialize client with credentials from AuthManager
      this.client = new ComfyApi(this.baseURL, undefined, {
        credentials: this.authManager.getCredentials(),
      });
      this.client.init();

      log('Client initialized with baseURL:', this.baseURL);
    } catch (error) {
      // Use ErrorHandlerService to transform internal errors to framework errors
      this.errorHandler.handleError(error);
    }
  }

  /**
   * Get authentication headers for image download
   * This method provides auth headers to framework layer without exposing credentials
   * @returns Authentication headers object, or undefined if no auth is configured
   */
  getAuthHeaders(): Record<string, string> | undefined {
    // Delegate to AuthManager
    return this.authManager.getAuthHeaders();
  }

  /**
   * Get the path for an image result
   */
  getPathImage(imageInfo: any): string {
    return this.client.getPathImage(imageInfo);
  }

  /**
   * Upload an image to ComfyUI server
   * @param file - The image data as Buffer or Blob
   * @param fileName - The name for the uploaded file
   * @returns The filename on ComfyUI server
   */
  async uploadImage(file: Buffer | Blob, fileName: string): Promise<string> {
    log('Uploading image to ComfyUI:', fileName);

    const result = await this.client.uploadImage(file, fileName);

    if (!result) {
      throw new ServicesError(
        'Failed to upload image to ComfyUI server',
        ServicesError.Reasons.UPLOAD_FAILED,
        { fileName, response: result },
      );
    }

    log('Image uploaded successfully:', result.info.filename);
    return result.info.filename;
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflow: PromptBuilder<any, any, any>,
    onProgress?: ProgressCallback,
  ): Promise<WorkflowResult> {
    log('Executing workflow...');

    return new Promise<WorkflowResult>((resolve, reject) => {
      new CallWrapper(this.client, workflow)
        .onFinished((result: any) => {
          log('Workflow execution finished successfully');
          log('🔍 Raw workflow result structure:', {
            hasImages: 'images' in result,
            hasRaw: '_raw' in result,
            keys: Object.keys(result),
            rawKeys: result._raw ? Object.keys(result._raw) : null,
          });
          resolve(result);
        })
        .onFailed((error: any) => {
          log('Workflow execution failed:', error?.message || error);
          reject(error);
        })
        .onProgress((info: any) => {
          log('Progress:', info);
          onProgress?.(info);
        })
        .run();
    });
  }

  /**
   * Fetch API endpoint
   */
  // @deprecated This method should not be used directly
  // Use specific SDK methods instead (getCheckpoints, getNodeDefs, etc.)
  // Keeping for backward compatibility with tests only
  // Removed: Do not use fetchApi directly
  // All API calls should use specific SDK methods:
  // - getCheckpoints() for models
  // - getNodeDefs() for node definitions
  // - getLoras() for LoRA models
  // - getSamplerInfo() for samplers

  /**
  /**
   * Get available checkpoints from ComfyUI
   * Wraps SDK method to avoid Law of Demeter violation
   * Uses unified TTL cache for performance optimization
   */
  async getCheckpoints(): Promise<string[]> {
    return await this.cacheManager.get('checkpoints', async () => {
      return await this.client.getCheckpoints();
    });
  }

  /**
   * Get available LoRAs from ComfyUI
   * Wraps SDK method to avoid Law of Demeter violation
   * Uses unified TTL cache for performance optimization
   */
  async getLoras(): Promise<string[]> {
    return await this.cacheManager.get('loras', async () => {
      return await this.client.getLoras();
    });
  }

  /**
   * Get node definitions from ComfyUI
   * Wraps SDK method to avoid Law of Demeter violation
   * Uses unified TTL cache for performance optimization
   * @param nodeName - Optional specific node name to query
   */
  async getNodeDefs(nodeName?: string): Promise<any> {
    const allNodeDefs = await this.cacheManager.get('nodeDefs', async () => {
      return await this.client.getNodeDefs();
    });

    // Return specific node or all nodes
    return nodeName && allNodeDefs ? { [nodeName]: allNodeDefs[nodeName] } : allNodeDefs;
  }

  /**
   * Get sampler info from ComfyUI
   * Wraps SDK method to avoid Law of Demeter violation
   */
  async getSamplerInfo(): Promise<{ samplerName: string[]; scheduler: string[] }> {
    const info = await this.client.getSamplerInfo();

    return {
      samplerName: this.extractStrings(info.sampler),
      scheduler: this.extractStrings(info.scheduler),
    };
  }

  /**
   * Extract string values from sampler info arrays
   * Handle both string arrays and tuple arrays like ['euler', { tooltip: 'info' }]
   */
  private extractStrings(arr: any): string[] {
    if (!Array.isArray(arr)) return [];
    return arr
      .map((item) => (Array.isArray(item) ? item[0] : item))
      .filter((item) => typeof item === 'string');
  }

  /**
   * Validate connection to ComfyUI server
   * Uses direct fetch to system_stats endpoint for health check
   */
  async validateConnection(): Promise<boolean> {
    // Check if already validated and not expired
    if (this.connectionManager.isValidated()) {
      return true;
    }

    try {
      // Use system_stats endpoint for health check
      // This is a lightweight endpoint that returns system information
      const url = `${this.baseURL}/system_stats`;
      const headers = this.authManager.getAuthHeaders() || {};

      log('Validating connection to:', url);

      const response = await fetch(url, {
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        method: 'GET',
        mode: 'cors',
      });

      // Just check if we got a successful response
      if (!response.ok) {
        this.connectionManager.invalidate();
        // Throw ServicesError with status for error parser to handle
        throw new ServicesError(
          `HTTP ${response.status}: ${response.statusText}`,
          ServicesError.Reasons.CONNECTION_FAILED,
          { endpoint: '/system_stats', status: response.status, statusText: response.statusText },
        );
      }

      // Verify response is valid JSON
      const data = await response.json();
      if (!data || typeof data !== 'object') {
        throw new ServicesError(
          'Invalid response from ComfyUI server',
          ServicesError.Reasons.CONNECTION_FAILED,
          { endpoint: '/system_stats' },
        );
      }

      this.connectionManager.markAsValidated();
      log('Connection validated successfully');
      return true;
    } catch (error) {
      // Reset connection state on any error
      this.connectionManager.invalidate();

      // Re-throw all errors - let the service layer handle error classification
      throw error;
    }
  }
}
