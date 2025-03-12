import { and, eq } from 'drizzle-orm/expressions';

import { NewEvaluationRecordsItem, evaluationRecords } from '@/database/schemas';
import { serverDB } from '@/database/server';

export class EvaluationRecordModel {
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

  batchCreate = async (params: NewEvaluationRecordsItem[]) => {
    return serverDB
      .insert(evaluationRecords)
      .values(params.map((item) => ({ ...item, userId: this.userId })))
      .returning();
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

  findById = async (id: number) => {
    return serverDB.query.evaluationRecords.findFirst({
      where: and(eq(evaluationRecords.id, id), eq(evaluationRecords.userId, this.userId)),
    });
  };

  findByEvaluationId = async (evaluationId: number) => {
    return serverDB.query.evaluationRecords.findMany({
      where: and(
        eq(evaluationRecords.evaluationId, evaluationId),
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
