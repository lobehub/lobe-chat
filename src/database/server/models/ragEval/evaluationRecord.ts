import { and, eq } from 'drizzle-orm';

import { serverDB } from '@/database/server';
import { NewEvaluationRecordsItem, evaluationRecords } from '@/database/server/schemas/lobechat';

export class EvalResultModel {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  create = async (params: NewEvaluationRecordsItem) => {
    const [result] = await serverDB
      .insert(evaluationRecords)
      .values({ ...params, userId: this.userId })
      .returning();
    return result;
  };

  delete = async (id: number) => {
    return serverDB
      .delete(evaluationRecords)
      .where(and(eq(evaluationRecords.id, id), eq(evaluationRecords.userId, this.userId)));
  };

  query = async (reportId: number) => {
    return serverDB.query.evaluationRecords.findMany({
      where: and(
        eq(evaluationRecords.evaluationId, reportId),
        eq(evaluationRecords.userId, this.userId),
      ),
    });
  };

  update = async (id: number, value: Partial<NewEvaluationRecordsItem>) => {
    return serverDB
      .update(evaluationRecords)
      .set(value)
      .where(and(eq(evaluationRecords.id, id), eq(evaluationRecords.userId, this.userId)));
  };
}
