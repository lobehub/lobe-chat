import { z } from 'zod';

import { DEFAULT_FILE_EMBEDDING_MODEL_ITEM } from '@/const/settings/knowledge';
import { UserMemoryModel } from '@/database/models/userMemory';
import { authedProcedure, router } from '@/libs/trpc/lambda';
import { keyVaults, serverDatabase } from '@/libs/trpc/lambda/middleware';
import { getServerDefaultFilesConfig } from '@/server/globalConfig';
import { initModelRuntimeWithUserPayload } from '@/server/modules/ModelRuntime';

const saveMemorySchema = z.object({
  details: z.string().optional(),
  memoryCategory: z.string().optional(),
  memoryLayer: z.string().optional(),
  memoryType: z.string().optional(),
  summary: z.string(),
  title: z.string(),
});

const retrieveMemorySchema = z.object({
  limit: z.string().optional(),
  memoryCategory: z.string().optional(),
  memoryType: z.string().optional(),
  query: z.string(),
});

const categorizeContextSchema = z.object({
  associatedObjects: z.unknown().optional(),
  associatedSubjects: z.unknown().optional(),
  contextId: z.string().optional(),
  currentStatus: z.string().optional(),
  description: z.string().optional(),
  descriptionVector: z.array(z.number()).length(1024).optional(),
  extractedLabels: z.unknown().optional(),
  labels: z.unknown().optional(),
  scoreImpact: z.number().optional(),
  scoreUrgency: z.number().optional(),
  title: z.string().optional(),
  titleVector: z.array(z.number()).length(1024).optional(),
  type: z.string().optional(),
});

const categorizePreferenceSchema = z.object({
  conclusionDirectives: z.string().optional(),
  conclusionDirectivesVector: z.array(z.number()).length(1024).optional(),
  contextId: z.string().optional(),
  extractedLabels: z.unknown().optional(),
  extractedScopes: z.unknown().optional(),
  labels: z.unknown().optional(),
  preferenceId: z.string().optional(),
  scorePriority: z.number().optional(),
  suggestions: z.string().optional(),
  type: z.string().optional(),
});

// Add middleware for memory operations
const memoryProcedure = authedProcedure
  .use(serverDatabase)
  .use(keyVaults)
  .use(async (opts) => {
    const { ctx } = opts;
    return opts.next({
      ctx: {
        memoryModel: new UserMemoryModel(ctx.serverDB, ctx.userId),
      },
    });
  });

export const memoryRouter = router({
  categorizeContext: memoryProcedure
    .input(categorizeContextSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { context, created } = await ctx.memoryModel.categorizeContext(input);

        return {
          contextId: context.id,
          created,
          message: created ? 'Context created successfully' : 'Context updated successfully',
          success: true,
        };
      } catch (error) {
        console.error('Failed to categorize context:', error);
        return {
          message: `Failed to categorize context: ${(error as Error).message}`,
          success: false,
        };
      }
    }),

  categorizePreference: memoryProcedure
    .input(categorizePreferenceSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const { preference, created } = await ctx.memoryModel.categorizePreference(input);

        return {
          message: created ? 'Preference created successfully' : 'Preference updated successfully',
          preferenceId: preference.id,
          success: true,
          updated: !created,
        };
      } catch (error) {
        console.error('Failed to categorize preference:', error);
        return {
          message: `Failed to categorize preference: ${(error as Error).message}`,
          success: false,
        };
      }
    }),

  retrieveMemory: memoryProcedure.input(retrieveMemorySchema).query(async ({ input, ctx }) => {
    try {
      // REVIEW: how to get the 'openai' from user setting?
      // Which provider to use?
      const agentRuntime = await initModelRuntimeWithUserPayload('openai', ctx.jwtPayload);

      const { model: embeddingModel } =
        getServerDefaultFilesConfig().embeddingModel || DEFAULT_FILE_EMBEDDING_MODEL_ITEM;

      const queryEmbeddings = await agentRuntime.embeddings({
        dimensions: 1024,
        input: input.query,
        model: embeddingModel,
      });

      const memories = await ctx.memoryModel.searchWithEmbedding({
        embedding: queryEmbeddings?.[0] || [],
        limit: input.limit ? parseInt(input.limit) : 5,
        memoryCategory: input.memoryCategory,
        memoryType: input.memoryType,
      });

      return { memories };
    } catch (error) {
      console.error('Failed to retrieve memories:', error);
      return { memories: [] };
    }
  }),

  saveMemory: memoryProcedure.input(saveMemorySchema).mutation(async ({ input, ctx }) => {
    try {
      // REVIEW: how to get the 'openai' from user setting?
      // Which provider to use?
      const agentRuntime = await initModelRuntimeWithUserPayload('openai', ctx.jwtPayload);

      const { model: embeddingModel } =
        getServerDefaultFilesConfig().embeddingModel || DEFAULT_FILE_EMBEDDING_MODEL_ITEM;

      const embeddings = await agentRuntime.embeddings({
        dimensions: 1024,
        input: input.summary,
        model: embeddingModel,
      });

      let detailsEmbedding: number[] | undefined;
      if (input.details) {
        const detailsEmbeddings = await agentRuntime.embeddings({
          dimensions: 1024,
          input: input.details,
          model: embeddingModel,
        });
        detailsEmbedding = detailsEmbeddings?.[0];
      }

      const result = await ctx.memoryModel.create({
        details: input.details,
        detailsVector1024: detailsEmbedding,
        memoryCategory: input.memoryCategory,
        memoryLayer: input.memoryLayer,
        memoryType: input.memoryType,
        summary: input.summary,
        summaryVector1024: embeddings?.[0],
        title: input.title,
      });

      return {
        memoryId: result.id,
        message: 'Memory saved successfully',
        success: true,
      };
    } catch (error) {
      console.error('Failed to save memory:', error);
      return {
        message: `Failed to save memory: ${(error as Error).message}`,
        success: false,
      };
    }
  }),
});
