import { CallWrapper, ComfyApi, PromptBuilder } from '@saintno/comfyui-sdk';
import type {
  BasicCredentials,
  BearerTokenCredentials,
  CustomCredentials,
} from '@saintno/comfyui-sdk';
import debug from 'debug';

import { ChatModelCard } from '@/types/llm';
import { ComfyUIKeyVault } from '@/types/user/settings';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import { CreateImagePayload, CreateImageResponse } from '../types/image';
import { parseComfyUIErrorMessage } from '../utils/comfyuiErrorParser';
import { AgentRuntimeError } from '../utils/createError';
import { MODEL_LIST_CONFIGS, processModelList } from '../utils/modelParse';
import { COMFYUI_DEFAULTS, COMFYUI_ERROR_TYPES } from './constants';
import { ModelResolver } from './utils/modelResolver';
import { WorkflowDetector } from './utils/workflowDetector';
import { WorkflowRouter } from './utils/workflowRouter';

const log = debug('lobe-image:comfyui');
// Removed unused debugVerbose variable

/**
 * ComfyUI Runtime implementation / ComfyUI Runtime 实现
 * Supports text-to-image and image editing for FLUX series models / 支持 FLUX 系列模型的文生图和图像编辑
 */
// Export ComfyUI utilities and types
export { ModelResolver as ComfyUIModelResolver } from './utils/modelResolver';
export * from './workflows';

export class LobeComfyUI implements LobeRuntimeAI {
  private client: ComfyApi;
  private options: ComfyUIKeyVault;
  private modelResolver: ModelResolver;

  private connectionValidated: boolean;
  baseURL: string;

  constructor(options: ComfyUIKeyVault = {}) {
    console.log('🏗️ ComfyUI Constructor called with options:', {
      authType: options.authType,
      baseURL: options.baseURL,
    });
    const { baseURL, authType = 'none', apiKey, username, password, customHeaders } = options;

    const resolvedBaseURL = baseURL || process.env.COMFYUI_DEFAULT_URL || COMFYUI_DEFAULTS.BASE_URL;

    if (authType === 'basic' && (!username || !password)) {
      throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidComfyUIArgs);
    }
    if (authType === 'bearer' && !apiKey) {
      throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidProviderAPIKey);
    }
    if (authType === 'custom' && (!customHeaders || Object.keys(customHeaders).length === 0)) {
      throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidComfyUIArgs);
    }

    this.options = options;
    this.baseURL = resolvedBaseURL;
    const credentials = this.createCredentials(this.options);
    this.connectionValidated = false;

    this.client = new ComfyApi(this.baseURL, undefined, { credentials });
    this.client.init();

    this.modelResolver = new ModelResolver(this.client);
  }

  /**
   * 确保 ComfyUI 连接有效，使用现有的错误处理器
   */
  private async ensureConnection(): Promise<void> {
    console.log('🚀🚀🚀 ensureConnection() CALLED - Starting connection validation');
    if (this.connectionValidated) {
      console.log('✅ Connection already validated, skipping');
      return;
    }

    try {
      const models = await this.modelResolver.getAvailableModelFiles();

      if (!Array.isArray(models)) {
        throw new Error('Invalid response from ComfyUI server');
      }

      this.connectionValidated = true;
    } catch (error: unknown) {
      console.log('🔥🔥🔥 ComfyUI Connection Error Caught:', {
        error: error,
        errorConstructor: (error as any)?.constructor?.name,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStatus: (error as any)?.status,
        errorStatusCode: (error as any)?.statusCode,
        errorType: typeof error,
      });
      log('Connection error caught:', error);

      const { error: parsedError, errorType } = parseComfyUIErrorMessage(error);
      throw AgentRuntimeError.createImage({
        error: parsedError,
        errorType,
        provider: 'comfyui',
      });
    }
  }

  /**
   * Discover available models from ComfyUI server
   */
  async models(): Promise<ChatModelCard[]> {
    await this.ensureConnection();

    try {
      const modelFiles = await this.modelResolver.getAvailableModelFiles();

      if (modelFiles.length === 0) {
        return [];
      }

      const modelList = this.modelResolver.transformModelFilesToList(modelFiles);

      const processedModels = await processModelList(
        modelList,
        MODEL_LIST_CONFIGS.comfyui || {},
        'comfyui',
      );

      return processedModels.map((model) => ({
        ...model,
        id: `comfyui/${model.id}`,
      }));
    } catch (error) {
      log('Failed to fetch models:', error);
      return [];
    }
  }

  /**
   * Create image
   */
  async createImage(payload: CreateImagePayload): Promise<CreateImageResponse> {
    const { model, params } = payload;

    try {
      // Validate and resolve model to actual filename
      const validation = await this.modelResolver.validateModel(model);
      if (!validation.exists) {
        throw AgentRuntimeError.createImage({
          error: new Error('ModelNotFound'),
          errorType: AgentRuntimeErrorType.ModelNotFound,
          provider: 'comfyui',
        });
      }

      const modelFileName = validation.actualFileName!;
      const workflow = this.buildWorkflow(model, modelFileName, params);

      log('=== WORKFLOW DEBUG ===');
      log('Model ID:', model);
      log('Model Filename:', modelFileName);
      log('=== END DEBUG ===');

      const result = await new Promise<any>((resolve, reject) => {
        new CallWrapper(this.client, workflow)
          .onFinished(resolve)
          .onFailed((error: any) => {
            log('❌ ComfyUI request failed:', error?.message || error);

            if (error && typeof error === 'object' && 'errorType' in error) {
              reject(error);
              return;
            }

            const { error: parsedError, errorType } = parseComfyUIErrorMessage(error);
            const structuredError = AgentRuntimeError.createImage({
              error: parsedError,
              errorType,
              provider: 'comfyui',
            });

            reject(structuredError);
          })
          .onProgress((info: any) => {
            log('Progress:', info);
          })
          .run();
      });

      const images = result.images?.images ?? [];
      if (images.length === 0) {
        throw AgentRuntimeError.createImage({
          error: new Error('Empty result from ComfyUI workflow'),
          errorType: COMFYUI_ERROR_TYPES.EMPTY_RESULT,
          provider: 'comfyui',
        });
      }

      const imageInfo = images[0];
      return {
        height: imageInfo.height ?? params.height,
        imageUrl: this.client.getPathImage(imageInfo),
        width: imageInfo.width ?? params.width,
      };
    } catch (error) {
      if (error && typeof error === 'object' && 'errorType' in error) {
        throw error;
      }

      const { error: parsedError, errorType } = parseComfyUIErrorMessage(error);

      throw AgentRuntimeError.createImage({
        error: parsedError,
        errorType,
        provider: 'comfyui',
      });
    }
  }

  /**
   * Build workflow using simple type detection
   */
  private buildWorkflow(
    model: string,
    modelFileName: string,
    params: Record<string, any>,
  ): PromptBuilder<any, any, any> {
    log('🔧 Building workflow for model:', model);

    // Use the resolved filename for detection, not the original model ID
    const detectionResult = WorkflowDetector.detectModelType(modelFileName);
    log('Model detection result:', detectionResult);

    if (!detectionResult.isSupported) {
      throw AgentRuntimeError.createError(AgentRuntimeErrorType.ModelNotFound, {
        error: 'ModelNotFound',
        model,
      });
    }

    try {
      const workflow = WorkflowRouter.routeWorkflow(model, detectionResult, modelFileName, params);

      log('✅ Workflow built successfully for:', model);
      return workflow;
    } catch (error) {
      // Check if it's already an AgentRuntimeError from workflow routing
      if (
        error &&
        typeof error === 'object' &&
        'errorType' in error &&
        error.errorType === AgentRuntimeErrorType.ComfyUIWorkflowError
      ) {
        // Re-throw ComfyUI workflow errors as-is
        throw error;
      }

      throw error;
    }
  }

  /**
   * Create authentication credentials
   * 创建身份验证凭据 - 根据认证类型返回相应的凭据对象
   *
   * @param options ComfyUI配置选项
   * @returns 身份验证凭据对象或undefined（无认证时）
   *
   * 注意：当authType='custom'但customHeaders为空/null/undefined时，
   * 构造函数已进行验证，此处不会到达该分支
   */
  private createCredentials(
    options: ComfyUIKeyVault,
  ): BasicCredentials | BearerTokenCredentials | CustomCredentials | undefined {
    const { authType = 'none', apiKey, username, password, customHeaders } = options;

    switch (authType) {
      case 'basic': {
        return { password: password!, type: 'basic', username: username! } as BasicCredentials;
      }

      case 'bearer': {
        return { token: apiKey!, type: 'bearer_token' } as BearerTokenCredentials;
      }

      case 'custom': {
        // 由于构造函数已验证customHeaders存在且非空，此处可以安全访问
        return { headers: customHeaders!, type: 'custom' } as CustomCredentials;
      }

      default: {
        return undefined;
      }
    }
  }
}
