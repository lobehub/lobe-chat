import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { initAgentRuntimeWithUserPayload } from '@/app/api/chat/agentRuntime';
import { chainAnswerWithContext } from '@/chains/answerWithContext';
import { DEFAULT_EMBEDDING_MODEL } from '@/const/settings';
import { ChunkModel } from '@/database/server/models/chunk';
import { EmbeddingModel } from '@/database/server/models/embedding';
import { FileModel } from '@/database/server/models/file';
import {
  EvalDatasetRecordModel,
  EvalEvaluationModel,
  EvaluationRecordModel,
} from '@/database/server/models/ragEval';
import { ModelProvider } from '@/libs/agent-runtime';
import { asyncAuthedProcedure, asyncRouter as router } from '@/libs/trpc/async';
import { ChunkService } from '@/server/services/chunk';

const ragEvalProcedure = asyncAuthedProcedure.use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: {
      chunkModel: new ChunkModel(ctx.userId),
      chunkService: new ChunkService(ctx.userId),
      datasetRecordModel: new EvalDatasetRecordModel(ctx.userId),
      embeddingModel: new EmbeddingModel(ctx.userId),
      evalRecordModel: new EvaluationRecordModel(ctx.userId),
      evaluationModel: new EvalEvaluationModel(ctx.userId),
      fileModel: new FileModel(ctx.userId),
    },
  });
});

export const ragEvalRouter = router({
  runRecordEvaluation: ragEvalProcedure
    .input(
      z.object({
        evalRecordId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const evalRecord = await ctx.evalRecordModel.findById(input.evalRecordId);

      if (!evalRecord) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Evaluation not found' });
      }

      const agentRuntime = await initAgentRuntimeWithUserPayload(
        ModelProvider.OpenAI,
        ctx.jwtPayload,
      );

      const {
        question,
        languageModel,
        context,
        embeddingModel = DEFAULT_EMBEDDING_MODEL,
      } = evalRecord;

      let questionEmbeddingId = evalRecord.questionEmbeddingId;

      // 如果不存在 questionEmbeddingId，那么就需要做一次 embedding
      if (!questionEmbeddingId) {
        const embeddings = await agentRuntime.embeddings({
          dimensions: 1024,
          input: question,
          model: embeddingModel!,
        });

        const embeddingId = await ctx.embeddingModel.create({
          embeddings: embeddings?.[0].embedding,
          model: embeddingModel,
        });

        await ctx.evalRecordModel.update(evalRecord.id, {
          questionEmbeddingId: embeddingId,
        });

        questionEmbeddingId = embeddingId;
      }

      // 如果不存在 context，那么就需要做一次检索
      if (!context || context.length === 0) {
        const datasetRecord = await ctx.datasetRecordModel.findById(evalRecord.datasetRecordId);

        const embeddingItem = await ctx.embeddingModel.findById(questionEmbeddingId);

        const chunks = await ctx.chunkModel.semanticSearchForChat({
          embedding: embeddingItem!.embeddings!,
          fileIds: datasetRecord!.referenceFiles!,
          query: evalRecord.question,
        });

        await ctx.evalRecordModel.update(evalRecord.id, {
          context: chunks.map((item) => item.text).filter(Boolean) as string[],
        });
      }

      // 做一次生成 LLM 答案生成
      const { messages } = chainAnswerWithContext({ context: context!, knowledge: [], question });

      const response = await agentRuntime.chat({
        messages: messages!,
        model: languageModel!,
        stream: false,
        temperature: 1,
      });

      console.log(await response.text());
    }),
});
