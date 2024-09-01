import { and, eq } from 'drizzle-orm';

import { serverDB } from '@/database/server';
import { NewEvalDatasetRecordsItem, evalDatasetRecords } from '@/database/server/schemas/lobechat';

export class EvalDatasetRecordModel {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  create = async (params: NewEvalDatasetRecordsItem) => {
    const [result] = await serverDB
      .insert(evalDatasetRecords)
      .values({ ...params, userId: this.userId })
      .returning();
    return result;
  };

  batchCreate = async (params: NewEvalDatasetRecordsItem[]) => {
    const [result] = await serverDB
      .insert(evalDatasetRecords)
      .values(params.map((item) => ({ ...item, userId: this.userId })))
      .returning();

    return result;
  };

  delete = async (id: number) => {
    return serverDB
      .delete(evalDatasetRecords)
      .where(and(eq(evalDatasetRecords.id, id), eq(evalDatasetRecords.userId, this.userId)));
  };

  query = async (datasetId: number) => {
    return serverDB.query.evalDatasetRecords.findMany({
      where: and(
        eq(evalDatasetRecords.datasetId, datasetId),
        eq(evalDatasetRecords.userId, this.userId),
      ),
    });
  };

  update = async (id: number, value: Partial<NewEvalDatasetRecordsItem>) => {
    return serverDB
      .update(evalDatasetRecords)
      .set(value)
      .where(and(eq(evalDatasetRecords.id, id), eq(evalDatasetRecords.userId, this.userId)));
  };
}
