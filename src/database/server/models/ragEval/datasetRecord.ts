import { and, eq, inArray } from 'drizzle-orm';

import { serverDB } from '@/database/server';
import {
  NewEvalDatasetRecordsItem,
  evalDatasetRecords,
  files,
} from '@/database/schemas';
import { EvalDatasetRecordRefFile } from '@/types/eval';

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
    const list = await serverDB.query.evalDatasetRecords.findMany({
      where: and(
        eq(evalDatasetRecords.datasetId, datasetId),
        eq(evalDatasetRecords.userId, this.userId),
      ),
    });
    const fileList = list.flatMap((item) => item.referenceFiles).filter(Boolean) as string[];

    const fileItems = await serverDB
      .select({ fileType: files.fileType, id: files.id, name: files.name })
      .from(files)
      .where(and(inArray(files.id, fileList), eq(files.userId, this.userId)))
      .execute();

    return list.map((item) => {
      return {
        ...item,
        referenceFiles: (item.referenceFiles?.map((fileId) => {
          return fileItems.find((file) => file.id === fileId);
        }) || []) as EvalDatasetRecordRefFile[],
      };
    });
  };

  findByDatasetId = async (datasetId: number) => {
    return serverDB.query.evalDatasetRecords.findMany({
      where: and(
        eq(evalDatasetRecords.datasetId, datasetId),
        eq(evalDatasetRecords.userId, this.userId),
      ),
    });
  };

  findById = async (id: number) => {
    return serverDB.query.evalDatasetRecords.findFirst({
      where: and(eq(evalDatasetRecords.id, id), eq(evalDatasetRecords.userId, this.userId)),
    });
  };

  update = async (id: number, value: Partial<NewEvalDatasetRecordsItem>) => {
    return serverDB
      .update(evalDatasetRecords)
      .set(value)
      .where(and(eq(evalDatasetRecords.id, id), eq(evalDatasetRecords.userId, this.userId)));
  };
}
