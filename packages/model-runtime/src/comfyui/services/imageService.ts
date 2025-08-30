/**
 * Image Service
 *
 * Business logic for image processing including URL fetching
 * and workflow execution
 */
import { PromptBuilder } from '@saintno/comfyui-sdk';
import debug from 'debug';

import { nanoid } from '@/utils/uuid';

import type { CreateImagePayload, CreateImageResponse } from '../../types/image';
import { ServicesError } from '../errors';
import { WorkflowDetector } from '../utils/workflowDetector';
import { ComfyUIClientService } from './comfyuiClient';
import { ErrorHandlerService } from './errorHandler';
import { ModelResolverService } from './modelResolver';
import { WorkflowBuilderService } from './workflowBuilder';

const log = debug('lobe-image:comfyui:image-service');

/**
 * Image Service
 * Handles all image generation business logic
 */
export class ImageService {
  private errorHandler: ErrorHandlerService;

  constructor(
    private clientService: ComfyUIClientService,
    private modelResolverService: ModelResolverService,
    private workflowBuilderService: WorkflowBuilderService,
  ) {
    this.errorHandler = new ErrorHandlerService();
  }

  /**
   * Create image with complete business logic
   * Optimized with parallel execution for independent operations
   */
  async createImage(payload: CreateImagePayload): Promise<CreateImageResponse> {
    const { model, params } = payload;

    try {
      // Parallel execution of independent operations (connection validation and model validation)
      const [, validation] = await Promise.all([
        this.clientService.validateConnection(),
        this.modelResolverService.validateModel(model),
      ]);

      if (!validation.exists) {
        throw new ServicesError(
          `Model not found: ${model}`,
          ServicesError.Reasons.MODEL_NOT_FOUND,
          { model },
        );
      }

      const modelFileName = validation.actualFileName!;

      // Parallel execution of image processing and workflow building
      // These are independent operations that can run concurrently
      const [, workflow] = await Promise.all([
        this.processImageFetch(params),
        this.buildWorkflow(model, modelFileName, params),
      ]);

      log('=== WORKFLOW DEBUG ===');
      log('Model ID:', model);
      log('Model Filename:', modelFileName);
      log('Has Image:', Boolean(params.imageUrl));
      log('=== END DEBUG ===');

      // Execute workflow
      const result = await this.clientService.executeWorkflow(workflow, (info: any) =>
        log('Progress:', info),
      );

      // Process results
      const images = result.images?.images ?? [];
      if (images.length === 0) {
        throw new ServicesError(
          'Empty result from ComfyUI workflow',
          ServicesError.Reasons.EMPTY_RESULT,
          { model, params },
        );
      }

      const imageInfo = images[0] as any;
      return {
        height: imageInfo.height ?? params.height ?? 1024,
        imageUrl: this.clientService.getPathImage(imageInfo),
        width: imageInfo.width ?? params.width ?? 1024,
      };
    } catch (error) {
      // All error handling delegated to ErrorHandlerService
      this.errorHandler.handleError(error);
    }
  }

  /**
   * Process image URLs for img2img workflows
   * Fetch image from URL and upload to ComfyUI
   */
  private async processImageFetch(params: Record<string, any>): Promise<void> {
    const imageUrl = params.imageUrl || params.imageUrls?.[0];

    if (!imageUrl) {
      return;
    }

    log('Processing image URL:', imageUrl);

    try {
      // Check if it's already a ComfyUI filename (not a URL)
      // ComfyUI filenames don't contain protocol prefixes
      if (!imageUrl.includes('://')) {
        // Already processed or is a ComfyUI filename
        log('Image already processed or is ComfyUI filename:', imageUrl);
        return;
      }

      // Fetch image from URL (both S3 and Desktop static server use HTTP)
      log('Fetching image from URL:', imageUrl);
      const response = await fetch(imageUrl);

      if (!response.ok) {
        throw new ServicesError(
          `Failed to fetch image: ${response.status} ${response.statusText}`,
          ServicesError.Reasons.IMAGE_FETCH_FAILED,
          { status: response.status, statusText: response.statusText, url: imageUrl },
        );
      }

      // Get image data as buffer
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      log('Image fetched successfully, size:', buffer.length);

      // Validate image data
      if (!buffer || buffer.length === 0) {
        throw new ServicesError('Invalid image data', ServicesError.Reasons.IMAGE_FETCH_FAILED, {
          url: imageUrl,
        });
      }

      // Check file size (limit to 30MB)
      const MAX_SIZE = 30 * 1024 * 1024;
      if (buffer.length > MAX_SIZE) {
        throw new ServicesError(
          `Image too large: ${buffer.length} bytes (max: ${MAX_SIZE})`,
          ServicesError.Reasons.IMAGE_TOO_LARGE,
          { maxSize: MAX_SIZE, size: buffer.length },
        );
      }

      log('Image fetched successfully, size:', buffer.length);

      // Upload to ComfyUI - use timestamp + 4-char random ID to prevent conflicts
      const fileName = `LobeChat_img2img_${Date.now()}_${nanoid(4)}.png`;
      const uploadedFileName = await this.clientService.uploadImage(buffer, fileName);

      log('Uploaded to ComfyUI as:', uploadedFileName);

      // Replace the URL with ComfyUI filename
      params.imageUrl = uploadedFileName;
      if (params.imageUrls) {
        params.imageUrls[0] = uploadedFileName;
      }
    } catch (error) {
      log('Failed to process image URL:', error);

      // Provide helpful error messages
      if ((error as Error).message?.includes('fetch')) {
        throw new ServicesError(
          `Unable to fetch image from URL: ${imageUrl}`,
          ServicesError.Reasons.IMAGE_FETCH_FAILED,
          { imageUrl, originalError: (error as Error).message },
        );
      }

      throw error;
    }
  }

  /**
   * Build workflow using detection and builder service
   */
  private async buildWorkflow(
    model: string,
    modelFileName: string,
    params: Record<string, any>,
  ): Promise<PromptBuilder<any, any, any>> {
    log('Building workflow for model:', model);

    // Use the resolved filename for detection
    const detectionResult = WorkflowDetector.detectModelType(modelFileName);
    log('Model detection result:', detectionResult);

    if (!detectionResult.isSupported) {
      throw new ServicesError(
        `Unsupported model type: ${model}`,
        ServicesError.Reasons.MODEL_NOT_FOUND,
        { model, modelFileName },
      );
    }

    // Build workflow using service
    const workflow = await this.workflowBuilderService.buildWorkflow(
      model,
      detectionResult,
      modelFileName,
      params,
    );

    log('Workflow built successfully for:', model);
    return workflow;
  }
}
