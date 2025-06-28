import debug from 'debug';
import { z } from 'zod';

import { ASYNC_TASK_TIMEOUT, AsyncTaskModel } from '@/database/models/asyncTask';
import { FileModel } from '@/database/models/file';
import { GenerationModel } from '@/database/models/generation';
import { AgentRuntimeErrorType } from '@/libs/model-runtime/error';
import { CreateImageParams } from '@/libs/model-runtime/types/image';
import { asyncAuthedProcedure, asyncRouter as router } from '@/libs/trpc/async';
import { initAgentRuntimeWithUserPayload } from '@/server/modules/AgentRuntime';
import { GenerationService } from '@/server/services/generation';
import { AsyncTaskError, AsyncTaskErrorType, AsyncTaskStatus } from '@/types/asyncTask';

const log = debug('lobe-image:async');

const imageProcedure = asyncAuthedProcedure.use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: {
      asyncTaskModel: new AsyncTaskModel(ctx.serverDB, ctx.userId),
      generationModel: new GenerationModel(ctx.serverDB, ctx.userId),
      fileModel: new FileModel(ctx.serverDB, ctx.userId),
      generationService: new GenerationService(ctx.serverDB, ctx.userId),
    },
  });
});

const createImageInputSchema = z.object({
  taskId: z.string(),
  generationId: z.string(),
  provider: z.string(),
  model: z.string(),
  params: z
    .object({
      prompt: z.string(),
      imageUrls: z.array(z.string()).optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      seed: z.number().nullable().optional(),
      steps: z.number().optional(),
      cfg: z.number().optional(),
    })
    .passthrough(),
});

export const imageRouter = router({
  createImage: imageProcedure.input(createImageInputSchema).mutation(async ({ input, ctx }) => {
    const { taskId, generationId, provider, model, params } = input;

    log('Starting async image generation: %O', {
      taskId,
      generationId,
      provider,
      model,
      prompt: params.prompt,
      imageParams: { width: params.width, height: params.height, steps: params.steps },
    });

    log('Updating task status to Processing: %s', taskId);
    await ctx.asyncTaskModel.update(taskId, { status: AsyncTaskStatus.Processing });

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(
            new AsyncTaskError(
              AsyncTaskErrorType.Timeout,
              'image generation task is timeout, please try again',
            ),
          );
        }, ASYNC_TASK_TIMEOUT);
      });

      const imageGenerationPromise = async () => {
        log('Initializing agent runtime for provider: %s', provider);
        const agentRuntime = await initAgentRuntimeWithUserPayload(provider, ctx.jwtPayload);

        log('Agent runtime initialized, calling createImage');
        const response = await agentRuntime.createImage({
          model,
          params: params as unknown as CreateImageParams,
        });

        if (!response) {
          log('Create image response is empty');
          throw new Error('Create image response is empty');
        }

        log('Image generation successful: %O', {
          imageUrl: response.imageUrl.startsWith('data:')
            ? response.imageUrl.slice(0, 100) + '...'
            : response.imageUrl,
          width: response.width,
          height: response.height,
        });

        log('Transforming image for generation');
        const { imageUrl, width, height } = response;
        const { image, thumbnailImage } =
          await ctx.generationService.transformImageForGeneration(imageUrl);
        log('Uploading image for generation');
        const { imageUrl: uploadedImageUrl, thumbnailImageUrl } =
          await ctx.generationService.uploadImageForGeneration(image, thumbnailImage);

        log('Updating generation asset and file');
        await ctx.generationModel.updateAssetAndFile(
          generationId,
          {
            originalUrl: imageUrl,
            url: uploadedImageUrl,
            width: width ?? image.width,
            height: height ?? image.height,
            thumbnailUrl: thumbnailImageUrl,
          },
          {
            fileType: image.mime,
            fileHash: image.hash,
            name: `${params.prompt.slice(0, 50)}.${image.extension}`, // 使用 prompt 前50个字符作为文件名
            size: image.size,
            url: uploadedImageUrl,
            metadata: {
              width: image.width,
              height: image.height,
              generationId,
            },
          },
        );

        log('Updating task status to Success: %s', taskId);
        await ctx.asyncTaskModel.update(taskId, {
          status: AsyncTaskStatus.Success,
        });

        log('Async image generation completed successfully: %s', taskId);
        return { success: true };
      };

      // Race between the image generation process and the timeout
      return await Promise.race([imageGenerationPromise(), timeoutPromise]);
    } catch (e: any) {
      log('Async image generation failed: %O', {
        taskId,
        generationId,
        error: e,
      });

      // error from model runtime
      if (e.errorType === AgentRuntimeErrorType.InvalidProviderAPIKey) {
        await ctx.asyncTaskModel.update(taskId, {
          error: new AsyncTaskError(
            AsyncTaskErrorType.InvalidProviderAPIKey,
            'Invalid provider API key, please check your API key',
          ),
          status: AsyncTaskStatus.Error,
        });
      } else {
        await ctx.asyncTaskModel.update(taskId, {
          error: new AsyncTaskError((e as Error).name, (e as Error).message),
          status: AsyncTaskStatus.Error,
        });
      }

      log('Task status updated to Error: %s', taskId);

      return {
        message: `Image generation ${taskId} failed: ${(e as Error).message}`,
        success: false,
      };
    }
  }),
});
