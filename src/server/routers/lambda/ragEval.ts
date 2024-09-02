/* eslint-disable sort-keys-fix/sort-keys-fix  */
import { TRPCError } from '@trpc/server';
import JSONL from 'jsonl-parse-stringify';
import pMap from 'p-map';
import { z } from 'zod';

import { FileModel } from '@/database/server/models/file';
import {
  EvalDatasetModel,
  EvalDatasetRecordModel,
  EvalEvaluationModel,
  EvaluationRecordModel,
} from '@/database/server/models/ragEval';
import { authedProcedure, router } from '@/libs/trpc';
import { S3 } from '@/server/modules/S3';
import { createAsyncServerClient } from '@/server/routers/async';
import {
  EvalDatasetRecord,
  EvalEvaluationStatus,
  InsertEvalDatasetRecord,
  RAGEvalDataSetItem,
  insertEvalDatasetRecordSchema,
  insertEvalDatasetsSchema,
  insertEvalEvaluationSchema,
} from '@/types/eval';

const ragEvalProcedure = authedProcedure.use(async (opts) => {
  const { ctx } = opts;

  return opts.next({
    ctx: {
      datasetModel: new EvalDatasetModel(ctx.userId),
      fileModel: new FileModel(ctx.userId),
      datasetRecordModel: new EvalDatasetRecordModel(ctx.userId),
      evaluationModel: new EvalEvaluationModel(ctx.userId),
      evaluationRecordModel: new EvaluationRecordModel(ctx.userId),
    },
  });
});

export const ragEvalRouter = router({
  createDataset: ragEvalProcedure
    .input(
      z.object({
        description: z.string().optional(),
        knowledgeBaseId: z.string(),
        name: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const data = await ctx.datasetModel.create({
        description: input.description,
        knowledgeBaseId: input.knowledgeBaseId,
        name: input.name,
      });

      return data?.id;
    }),

  getDatasets: ragEvalProcedure
    .input(z.object({ knowledgeBaseId: z.string() }))

    .query(async ({ ctx, input }): Promise<RAGEvalDataSetItem[]> => {
      return ctx.datasetModel.query(input.knowledgeBaseId);
    }),

  removeDataset: ragEvalProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.datasetModel.delete(input.id);
    }),

  updateDataset: ragEvalProcedure
    .input(
      z.object({
        id: z.number(),
        value: insertEvalDatasetsSchema.partial(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.datasetModel.update(input.id, input.value);
    }),

  // Dataset Item operations
  createDatasetRecords: ragEvalProcedure
    .input(
      z.object({
        datasetId: z.number(),
        question: z.string(),
        ideal: z.string().optional(),
        referenceFiles: z.array(z.string()).optional(),
        metadata: z.record(z.unknown()).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const data = await ctx.datasetRecordModel.create(input);
      return data?.id;
    }),

  getDatasetRecords: ragEvalProcedure
    .input(z.object({ datasetId: z.number() }))
    .query(async ({ ctx, input }): Promise<EvalDatasetRecord[]> => {
      return ctx.datasetRecordModel.query(input.datasetId);
    }),

  removeDatasetRecords: ragEvalProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.datasetRecordModel.delete(input.id);
    }),

  updateDatasetRecords: ragEvalProcedure
    .input(
      z.object({
        id: z.number(),
        value: z
          .object({
            question: z.string(),
            ideal: z.string(),
            referenceFiles: z.array(z.string()),
            metadata: z.record(z.unknown()),
          })
          .partial(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.datasetRecordModel.update(input.id, input.value);
    }),

  importDatasetRecords: ragEvalProcedure
    .input(
      z.object({
        datasetId: z.number(),
        pathname: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const s3 = new S3();
      const dataStr = await s3.getFileContent(input.pathname);
      const items = JSONL.parse<InsertEvalDatasetRecord>(dataStr);

      insertEvalDatasetRecordSchema.array().parse(items);

      const data = await Promise.all(
        items.map(async ({ referenceFiles, question, ideal }) => {
          const files = typeof referenceFiles === 'string' ? [referenceFiles] : referenceFiles;

          let fileIds: string[] | undefined = undefined;

          if (files) {
            const items = await ctx.fileModel.findByNames(files);

            fileIds = items.map((item) => item.id);
          }

          return {
            question,
            ideal,
            referenceFiles: fileIds,
            datasetId: input.datasetId,
          };
        }),
      );

      return ctx.datasetRecordModel.batchCreate(data);
    }),

  // Evaluation operations
  startEvaluationTask: ragEvalProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // Start evaluation task
      const evaluation = await ctx.evaluationModel.findById(input.id);

      if (!evaluation) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Evaluation not found' });
      }

      // create evaluation records by dataset records
      const datasetRecords = await ctx.datasetRecordModel.findByDatasetId(evaluation.datasetId);

      if (datasetRecords.length === 0) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Dataset record is empty' });
      }

      const evalRecords = await ctx.evaluationRecordModel.batchCreate(
        datasetRecords.map((record) => ({
          evaluationId: input.id,
          datasetRecordId: record.id,
          question: record.question!,
          groundTruth: record.ideal,
          status: EvalEvaluationStatus.Pending,
        })),
      );

      const asyncCaller = await createAsyncServerClient(ctx.userId, ctx.jwtPayload!);

      pMap(
        evalRecords,
        async (record) => {
          asyncCaller.ragEval.runRecordEvaluation.mutate({ evalRecordId: record.id }).catch((e) => {
            throw new TRPCError({
              code: 'BAD_GATEWAY',
              message: `[${e.statusCode}] Failed to start evaluation task: ${e.message}`,
            });
          });
        },
        {
          concurrency: 30,
        },
      );

      // ctx.

      await ctx.evaluationModel.update(input.id, { status: EvalEvaluationStatus.Processing });

      return { success: true };
    }),
  createEvaluation: ragEvalProcedure
    .input(insertEvalEvaluationSchema)
    .mutation(async ({ input, ctx }) => {
      const data = await ctx.evaluationModel.create({
        description: input.description,
        knowledgeBaseId: input.knowledgeBaseId,
        datasetId: input.datasetId,
        name: input.name,
      });

      return data?.id;
    }),

  removeEvaluation: ragEvalProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.evaluationModel.delete(input.id);
    }),

  getEvaluationList: ragEvalProcedure
    .input(z.object({ knowledgeBaseId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.evaluationModel.query(input.knowledgeBaseId);
    }),
});
