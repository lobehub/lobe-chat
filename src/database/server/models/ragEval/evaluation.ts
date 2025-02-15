import { SQL, count } from 'drizzle-orm';
import { and, desc, eq, inArray } from 'drizzle-orm/expressions';

import {
  NewEvalEvaluationItem,
  evalDatasets,
  evalEvaluation,
  evaluationRecords,
} from '@/database/schemas';
import { serverDB } from '@/database/server';
import { EvalEvaluationStatus, RAGEvalEvaluationItem } from '@/types/eval';

export class EvalEvaluationModel {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  create = async (params: NewEvalEvaluationItem) => {
    const [result] = await serverDB
      .insert(evalEvaluation)
      .values({ ...params, userId: this.userId })
      .returning();
    return result;
  };

  delete = async (id: number) => {
    return serverDB
      .delete(evalEvaluation)
      .where(and(eq(evalEvaluation.id, id), eq(evalEvaluation.userId, this.userId)));
  };

  queryByKnowledgeBaseId = async (knowledgeBaseId: string) => {
    const evaluations = await serverDB
      .select({
        createdAt: evalEvaluation.createdAt,
        dataset: {
          id: evalDatasets.id,
          name: evalDatasets.name,
        },
        evalRecordsUrl: evalEvaluation.evalRecordsUrl,
        id: evalEvaluation.id,
        name: evalEvaluation.name,
        status: evalEvaluation.status,
        updatedAt: evalEvaluation.updatedAt,
      })
      .from(evalEvaluation)
      .leftJoin(evalDatasets, eq(evalDatasets.id, evalEvaluation.datasetId))
      .orderBy(desc(evalEvaluation.createdAt))
      .where(
        and(
          eq(evalEvaluation.userId, this.userId),
          eq(evalEvaluation.knowledgeBaseId, knowledgeBaseId),
        ),
      );

    // 然后查询每个评估的记录统计
    const evaluationIds = evaluations.map((evals) => evals.id);

    const recordStats = await serverDB
      .select({
        evaluationId: evaluationRecords.evaluationId,
        success: count(evaluationRecords.status).if(
          eq(evaluationRecords.status, EvalEvaluationStatus.Success),
        ) as SQL<number>,
        total: count(),
      })
      .from(evaluationRecords)
      .where(inArray(evaluationRecords.evaluationId, evaluationIds))
      .groupBy(evaluationRecords.evaluationId);

    return evaluations.map((evaluation) => {
      const stats = recordStats.find((stat) => stat.evaluationId === evaluation.id);

      return {
        ...evaluation,
        recordsStats: stats
          ? { success: Number(stats.success), total: Number(stats.total) }
          : { success: 0, total: 0 },
      } as RAGEvalEvaluationItem;
    });
  };

  findById = async (id: number) => {
    return serverDB.query.evalEvaluation.findFirst({
      where: and(eq(evalEvaluation.id, id), eq(evalEvaluation.userId, this.userId)),
    });
  };

  update = async (id: number, value: Partial<NewEvalEvaluationItem>) => {
    return serverDB
      .update(evalEvaluation)
      .set(value)
      .where(and(eq(evalEvaluation.id, id), eq(evalEvaluation.userId, this.userId)));
  };
}
