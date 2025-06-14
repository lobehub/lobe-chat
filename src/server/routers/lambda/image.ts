import { waitUntil } from '@vercel/functions';
import debug from 'debug';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { JWTPayload } from '@/const/auth';
import { AsyncTaskModel } from '@/database/models/asyncTask';
import {
  NewGeneration,
  NewGenerationBatch,
  asyncTasks,
  generationBatches,
  generations,
} from '@/database/schemas';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { keyVaults, serverDatabase } from '@/libs/trpc/lambda/middleware';
import { createAsyncServerClient } from '@/server/routers/async';
import {
  AsyncTaskError,
  AsyncTaskErrorType,
  AsyncTaskStatus,
  AsyncTaskType,
} from '@/types/asyncTask';
import { generateUniqueSeeds } from '@/utils/number';

const log = debug('lobe-image:lambda');

const imageProcedure = authedProcedure
  .use(keyVaults)
  .use(serverDatabase)
  .use(async (opts) => {
    const { ctx } = opts;

    const { apiKey } = ctx.jwtPayload;
    if (apiKey) {
      log('API key found in jwtPayload: %s', apiKey);
    } else {
      log('No API key found in jwtPayload');
    }

    return opts.next({
      ctx: {
        asyncTaskModel: new AsyncTaskModel(ctx.serverDB, ctx.userId),
      },
    });
  });

const createImageInputSchema = z.object({
  generationTopicId: z.string(),
  provider: z.string(),
  model: z.string(),
  params: z
    .object({
      prompt: z.string(),
      width: z.number().optional(),
      height: z.number().optional(),
      seed: z.number().nullable().optional(),
      steps: z.number().optional(),
      cfg: z.number().optional(),
    })
    .passthrough(),
});
export type CreateImageServicePayload = z.infer<typeof createImageInputSchema>;

export const imageRouter = router({
  createImage: imageProcedure.input(createImageInputSchema).mutation(async ({ input, ctx }) => {
    const { userId, serverDB, asyncTaskModel } = ctx;
    const { generationTopicId, provider, model, params } = input;

    log('Starting image creation process, input: %O', input);

    // 步骤 1: 在事务中原子性地创建所有数据库记录
    const { batch: createdBatch, generationsWithTasks } = await serverDB.transaction(async (tx) => {
      log('Starting database transaction for image generation');

      // 1. 创建 generationBatch
      const newBatch: NewGenerationBatch = {
        userId,
        generationTopicId,
        provider,
        model,
        prompt: params.prompt,
        width: params.width,
        height: params.height,
        config: params, // 将整个 params 作为 config 存储
      };
      log('Creating generation batch: %O', newBatch);
      const [batch] = await tx.insert(generationBatches).values(newBatch).returning();
      log('Generation batch created successfully: %s', batch.id);

      // 2. 创建 4 个 generation（一期固定生成 4 张）
      const imageNum = 4;
      const seeds =
        'seed' in params
          ? generateUniqueSeeds(imageNum)
          : Array.from({ length: imageNum }, () => null);
      const newGenerations: NewGeneration[] = Array.from({ length: imageNum }, (_, index) => {
        return {
          userId,
          generationBatchId: batch.id,
          seed: seeds[index],
        };
      });

      log('Creating %d generations for batch: %s', newGenerations.length, batch.id);
      const createdGenerations = await tx.insert(generations).values(newGenerations).returning();
      log(
        'Generations created successfully: %O',
        createdGenerations.map((g) => g.id),
      );

      // 3. 并发为每个 generation 创建 asyncTask（在事务中）
      log('Creating async tasks for generations');
      const generationsWithTasks = await Promise.all(
        createdGenerations.map(async (generation) => {
          // 在事务中直接创建 asyncTask
          const [createdAsyncTask] = await tx
            .insert(asyncTasks)
            .values({
              userId,
              status: AsyncTaskStatus.Pending,
              type: AsyncTaskType.ImageGeneration,
            })
            .returning();

          const asyncTaskId = createdAsyncTask.id;
          log('Created async task %s for generation %s', asyncTaskId, generation.id);

          // 更新 generation 的 asyncTaskId
          await tx
            .update(generations)
            .set({ asyncTaskId })
            .where(and(eq(generations.id, generation.id), eq(generations.userId, userId)));

          return { generation, asyncTaskId };
        }),
      );
      log('All async tasks created in transaction');

      return {
        batch,
        generationsWithTasks,
      };
    });

    log('Database transaction completed successfully. Starting async task triggers.');

    // 步骤 2: 使用 after 函数在响应后异步触发所有生图任务
    const asyncCaller = await createAsyncServerClient(userId, ctx.jwtPayload as JWTPayload);
    log('Async caller created, jwtPayload: %O', ctx.jwtPayload);
    log(
      'Scheduling %d async image generation tasks to run after response',
      generationsWithTasks.length,
    );

    // 使用 waitUntil 函数将任务调度到响应发送后执行
    waitUntil(
      (async () => {
        log('Background task triggered, starting async image generation tasks');

        await Promise.all(
          generationsWithTasks.map(async ({ generation, asyncTaskId }) => {
            try {
              log('Triggering async task %s for generation %s', asyncTaskId, generation.id);
              const start = performance.now();
              await asyncCaller.image.createImage.mutate({
                taskId: asyncTaskId,
                generationId: generation.id,
                provider,
                model,
                params,
              });

              const end = performance.now();
              log(
                'Successfully triggered async task %s, cost: %ds',
                asyncTaskId,
                (end - start) / 1000,
              );
            } catch (e) {
              log('Failed to trigger async task %s: %O', asyncTaskId, e);
              console.error('[createImage] async task trigger error:', e);

              await asyncTaskModel.update(asyncTaskId, {
                error: new AsyncTaskError(
                  AsyncTaskErrorType.TaskTriggerError,
                  'trigger image generation async task error. Please make sure the APP_URL is available from your server.',
                ),
                status: AsyncTaskStatus.Error,
              });
            }
          }),
        );

        log('All async tasks completed in background');
      })(),
    );

    log('Async tasks scheduled, returning immediate response');

    const createdGenerations = generationsWithTasks.map((item) => item.generation);

    log('Image creation process completed successfully: %O', {
      batchId: createdBatch.id,
      generationCount: createdGenerations.length,
      generationIds: createdGenerations.map((g) => g.id),
    });

    return {
      success: true,
      data: {
        batch: createdBatch,
        generations: createdGenerations,
      },
    };
  }),
});

export type ImageRouter = typeof imageRouter;
