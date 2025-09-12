import { z } from 'zod';

import { authedProcedure, router } from '@/libs/trpc/lambda';
// Import Framework layer services
import { ComfyUIClientService } from '@/server/services/comfyui/core/comfyUIClientService';
import { ImageService } from '@/server/services/comfyui/core/imageService';
import { ModelResolverService } from '@/server/services/comfyui/core/modelResolverService';
import { WorkflowBuilderService } from '@/server/services/comfyui/core/workflowBuilderService';
import type { WorkflowContext } from '@/server/services/comfyui/types';

// Standard RuntimeImageGenParams validation schema
const ComfyUIParamsSchema = z.object({
  aspectRatio: z.string().optional(),
  cfg: z.number().optional(),
  height: z.number().optional(),
  imageUrl: z.string().nullable().optional(),
  imageUrls: z.array(z.string()).optional(),
  prompt: z.string(),
  samplerName: z.string().optional(),
  scheduler: z.string().optional(),
  seed: z.number().nullable().optional(),
  size: z.string().optional(),
  steps: z.number().optional(),
  strength: z.number().optional(),
  width: z.number().optional(),
});

const ComfyUIOptionsSchema = z
  .object({
    apiKey: z.string().optional(),
    authType: z.enum(['none', 'basic', 'bearer', 'custom']).optional(),
    baseURL: z.string().optional(),
    customHeaders: z.record(z.string()).optional(),
    password: z.string().optional(),
    username: z.string().optional(),
  })
  .optional();

/**
 * ComfyUI tRPC Router
 * Exposes Framework layer services to Runtime layer
 */
export const comfyuiRouter = router({
  /**
   * Create image with complete business logic
   */
  createImage: authedProcedure
    .input(
      z.object({
        model: z.string(),
        options: ComfyUIOptionsSchema,
        params: ComfyUIParamsSchema,
      }),
    )
    .mutation(async ({ input }) => {
      const { model, params, options = {} } = input;

      // Initialize Framework layer services
      const clientService = new ComfyUIClientService(options);
      const modelResolverService = new ModelResolverService(clientService);

      // Create workflow context
      const context: WorkflowContext = {
        clientService,
        modelResolverService,
      };

      const workflowBuilderService = new WorkflowBuilderService(context);

      // Initialize image service with all dependencies
      const imageService = new ImageService(
        clientService,
        modelResolverService,
        workflowBuilderService,
      );

      // Execute image creation
      return imageService.createImage({
        model,
        params,
      });
    }),

  /**
   * Get authentication headers for image downloads
   */
  getAuthHeaders: authedProcedure
    .input(
      z.object({
        options: ComfyUIOptionsSchema,
      }),
    )
    .query(async ({ input }) => {
      const clientService = new ComfyUIClientService(input.options || {});
      return clientService.getAuthHeaders();
    }),

  /**
   * Get available models
   */
  getModels: authedProcedure
    .input(
      z.object({
        options: ComfyUIOptionsSchema,
      }),
    )
    .query(async ({ input }) => {
      const clientService = new ComfyUIClientService(input.options || {});
      const modelResolverService = new ModelResolverService(clientService);

      return modelResolverService.getAvailableModelFiles();
    }),

  /**
   * Validate ComfyUI connection
   */
  validateConnection: authedProcedure
    .input(
      z.object({
        baseURL: z.string(),
        options: ComfyUIOptionsSchema,
      }),
    )
    .mutation(async ({ input }) => {
      const clientService = new ComfyUIClientService(input.options || {});
      return clientService.validateConnection();
    }),
});

export type ComfyUIRouter = typeof comfyuiRouter;
