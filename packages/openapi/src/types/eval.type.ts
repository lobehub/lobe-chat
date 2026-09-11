import type { EvalRunMetrics, EvalRunTopicResult } from '@lobechat/types';
import { z } from 'zod';

import type {
  PublicEvalDataset,
  PublicEvalRun,
  PublicEvalRunTopic,
  PublicEvalTestCase,
} from '../helpers/public-fields';
import type { PaginationQueryResponse } from './common.type';
import { PaginationQuerySchema } from './common.type';

export const CreateEvalRunRequestSchema = z
  .object({
    config: z
      .object({
        k: z.number().int().min(1).max(10).optional(),
        maxSteps: z.number().int().min(1).max(1000).optional(),
        timeout: z
          .number()
          .int()
          .min(60_000)
          .max(6 * 3_600_000)
          .optional(),
      })
      .strict()
      .optional(),
    datasetId: z.string().min(1).max(128),
    id: z.string().min(1).max(128).optional(),
    name: z.string().trim().min(1).max(255).optional(),
    targetAgentId: z.string().min(1).max(128),
  })
  .strict();

export const EvalRunIdParamSchema = z.object({ id: z.string().min(1).max(128) });

export const EvalDatasetIdParamSchema = z.object({ id: z.string().min(1).max(128) });

const EvalPaginationQuerySchema = PaginationQuerySchema.pick({ page: true, pageSize: true });

export const EvalRunListQuerySchema = EvalPaginationQuerySchema.extend({
  datasetId: z.string().min(1).max(128).optional(),
  status: z
    .enum(['idle', 'pending', 'running', 'completed', 'failed', 'aborted', 'external'])
    .optional(),
});

export const EvalDatasetListQuerySchema = EvalPaginationQuerySchema.extend({
  benchmarkId: z.string().min(1).max(128).optional(),
});

export const EvalRunTopicListQuerySchema = EvalPaginationQuerySchema;

export type CreateEvalRunRequest = z.infer<typeof CreateEvalRunRequestSchema>;
export type EvalRunListQuery = z.infer<typeof EvalRunListQuerySchema>;
export type EvalDatasetListQuery = z.infer<typeof EvalDatasetListQuerySchema>;
export type EvalRunTopicListQuery = z.infer<typeof EvalRunTopicListQuerySchema>;

export interface EvalRunResponse {
  createdAt: Date;
  datasetId: string;
  id: string;
  metrics: EvalRunMetrics | null;
  name: null | string;
  startedAt: Date | null;
  status: string;
  targetAgentId: null | string;
  updatedAt: Date;
}

export interface EvalRunResultResponse {
  createdAt: Date;
  input: string;
  passed: boolean | null;
  result: EvalRunTopicResult | null;
  score: null | number;
  status: null | string;
  testCaseId: string;
  topicId: string;
}

export interface EvalRunResultsResponse {
  results: EvalRunResultResponse[];
  runId: string;
  total: number;
}

export type EvalRunListResponse = PaginationQueryResponse<{ runs: PublicEvalRun[] }>;

export type EvalDatasetListResponse = PaginationQueryResponse<{ datasets: PublicEvalDataset[] }>;

export interface EvalDatasetDetailResponse extends PublicEvalDataset {
  testCases: PublicEvalTestCase[];
}

export interface EvalRunTopicResponse extends PublicEvalRunTopic {
  input: string;
}

export type EvalRunTopicListResponse = PaginationQueryResponse<{
  runId: string;
  topics: EvalRunTopicResponse[];
}>;
