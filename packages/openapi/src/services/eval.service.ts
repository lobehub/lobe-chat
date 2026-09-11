import type { EvalRunTopicResult } from '@lobechat/types';

import {
  AgentEvalDatasetModel,
  AgentEvalRunModel,
  AgentEvalRunTopicModel,
} from '@/database/models/agentEval';
import type { AgentEvalRunItem } from '@/database/schemas';
import type { LobeChatDatabase } from '@/database/type';
import { AgentEvalRunService, RUN_CREATE_ID_CONFLICT } from '@/server/services/agentEvalRun';
import { AgentEvalRunWorkflow } from '@/server/workflows/agentEvalRun';

import { BaseService } from '../common/base.service';
import { processPaginationConditions } from '../helpers/pagination';
import {
  projectPublicEvalDataset,
  projectPublicEvalRun,
  projectPublicEvalRunTopic,
  projectPublicEvalTestCase,
} from '../helpers/public-fields';
import type {
  CreateEvalRunRequest,
  EvalDatasetDetailResponse,
  EvalDatasetListQuery,
  EvalDatasetListResponse,
  EvalRunListQuery,
  EvalRunListResponse,
  EvalRunResponse,
  EvalRunResultsResponse,
  EvalRunTopicListQuery,
  EvalRunTopicListResponse,
} from '../types/eval.type';

const projectRun = (run: AgentEvalRunItem): EvalRunResponse => ({
  createdAt: run.createdAt,
  datasetId: run.datasetId,
  id: run.id,
  metrics: run.metrics,
  name: run.name,
  startedAt: run.startedAt,
  status: run.status,
  targetAgentId: run.targetAgentId,
  updatedAt: run.updatedAt,
});

const projectResult = (value: EvalRunTopicResult | null): EvalRunTopicResult | null => {
  if (!value) return null;
  return {
    awaitingExternalEval: value.awaitingExternalEval,
    completionReason: value.completionReason,
    cost: value.cost,
    duration: value.duration,
    error: value.error,
    extractedAnswer: value.extractedAnswer,
    llmCalls: value.llmCalls,
    passAllK: value.passAllK,
    passAtK: value.passAtK,
    rubricScores: value.rubricScores,
    steps: value.steps,
    threads: value.threads?.map((thread) => ({
      completionReason: thread.completionReason,
      cost: thread.cost,
      duration: thread.duration,
      error: thread.error,
      llmCalls: thread.llmCalls,
      passed: thread.passed,
      rubricScores: thread.rubricScores,
      score: thread.score,
      status: thread.status,
      steps: thread.steps,
      threadId: thread.threadId,
      tokens: thread.tokens,
      toolCalls: thread.toolCalls,
    })),
    tokens: value.tokens,
    toolCalls: value.toolCalls,
    totalCost: value.totalCost,
    totalDuration: value.totalDuration,
    totalTokens: value.totalTokens,
  };
};

export class EvalService extends BaseService {
  private datasetModel: AgentEvalDatasetModel;
  private runModel: AgentEvalRunModel;
  private runService: AgentEvalRunService;
  private runTopicModel: AgentEvalRunTopicModel;

  constructor(db: LobeChatDatabase, userId: string, workspaceId?: string) {
    super(db, userId, workspaceId);
    this.datasetModel = new AgentEvalDatasetModel(db, userId, workspaceId);
    this.runModel = new AgentEvalRunModel(db, userId, workspaceId);
    this.runService = new AgentEvalRunService(db, userId, workspaceId);
    this.runTopicModel = new AgentEvalRunTopicModel(db, userId, workspaceId);
  }

  async createRun(request: CreateEvalRunRequest): Promise<EvalRunResponse> {
    let run: AgentEvalRunItem;
    try {
      run = await this.runService.createRun({ ...request, mode: 'internal' });
    } catch (error) {
      if (error instanceof Error && error.message === RUN_CREATE_ID_CONFLICT) {
        throw this.createConflictError('Eval run id already exists with different parameters');
      }
      throw this.createBusinessError(
        error instanceof Error ? error.message : 'Failed to create eval run',
      );
    }

    // queue() is conditional idle -> pending. An idempotent retry sees the
    // existing pending/running/terminal run and does not dispatch twice.
    const queued = await this.runModel.queue(run.id);
    if (queued) {
      try {
        await AgentEvalRunWorkflow.triggerRunBenchmark({ runId: run.id, userId: this.userId });
      } catch (error) {
        await this.runModel.update(run.id, { status: 'idle' });
        throw this.createBusinessError(
          `Failed to queue eval run: ${error instanceof Error ? error.message : 'unknown error'}`,
        );
      }
      run = queued;
    }

    return projectRun(run);
  }

  async listRuns(query: EvalRunListQuery): Promise<EvalRunListResponse> {
    const { limit, offset } = processPaginationConditions(query);
    const filter = { datasetId: query.datasetId, status: query.status };

    const [runs, total] = await Promise.all([
      this.runModel.query({ ...filter, limit, offset }),
      this.runModel.count(filter),
    ]);

    return { runs: runs.map(projectPublicEvalRun), total };
  }

  async listDatasets(query: EvalDatasetListQuery): Promise<EvalDatasetListResponse> {
    const { limit, offset } = processPaginationConditions(query);
    const filter = { benchmarkId: query.benchmarkId };

    const [datasets, total] = await Promise.all([
      this.datasetModel.queryList({ ...filter, limit, offset }),
      this.datasetModel.count(filter),
    ]);

    return { datasets: datasets.map(projectPublicEvalDataset), total };
  }

  async getDataset(id: string): Promise<EvalDatasetDetailResponse> {
    const dataset = await this.datasetModel.findById(id);
    if (!dataset) throw this.createNotFoundError('Eval dataset not found');

    const { testCases, ...rest } = dataset;

    return {
      ...projectPublicEvalDataset(rest),
      testCases: testCases.map(projectPublicEvalTestCase),
    };
  }

  async getRunTopics(id: string, query: EvalRunTopicListQuery): Promise<EvalRunTopicListResponse> {
    // Ownership check first: a run owned by someone else is a plain 404.
    const run = await this.runModel.findById(id);
    if (!run) throw this.createNotFoundError('Eval run not found');

    const { limit, offset } = processPaginationConditions(query);

    const [rows, total] = await Promise.all([
      this.runTopicModel.findByRunId(id, { limit, offset }),
      this.runTopicModel.countByRunId(id),
    ]);

    return {
      runId: id,
      topics: rows.map((row) => ({
        ...projectPublicEvalRunTopic(row),
        input: row.testCase?.content.input ?? '',
      })),
      total,
    };
  }

  async getRun(id: string): Promise<EvalRunResponse> {
    // getRunDetails also applies the existing timeout reconciliation logic.
    const detail = await this.runService.getRunDetails(id);
    if (!detail) throw this.createNotFoundError('Eval run not found');
    return projectRun(detail);
  }

  async getRunResults(id: string): Promise<EvalRunResultsResponse> {
    const run = await this.runModel.findById(id);
    if (!run) throw this.createNotFoundError('Eval run not found');
    const topics = await this.runTopicModel.findByRunId(id);

    return {
      results: topics.map((topic) => ({
        createdAt: topic.createdAt,
        input: topic.testCase?.content.input ?? '',
        passed: topic.passed,
        result: projectResult(topic.evalResult),
        score: topic.score,
        status: topic.status,
        testCaseId: topic.testCaseId,
        topicId: topic.topicId,
      })),
      runId: id,
      total: topics.length,
    };
  }
}
