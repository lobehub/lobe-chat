import { and, desc, eq } from 'drizzle-orm';

import { NewEvalDatasetsItem, evalDatasets } from '@/database/schemas';
import { serverDB } from '@/database/server';
import { RAGEvalDataSetItem } from '@/types/eval';

export class EvalDatasetModel {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  create = async (params: NewEvalDatasetsItem) => {
    const [result] = await serverDB
      .insert(evalDatasets)
      .values({ ...params, userId: this.userId })
      .returning();
    return result;
  };

  delete = async (id: number) => {
    return serverDB
      .delete(evalDatasets)
      .where(and(eq(evalDatasets.id, id), eq(evalDatasets.userId, this.userId)));
  };

  query = async (knowledgeBaseId: string): Promise<RAGEvalDataSetItem[]> => {
    return serverDB
      .select({
        createdAt: evalDatasets.createdAt,
        description: evalDatasets.description,
        id: evalDatasets.id,
        name: evalDatasets.name,
        updatedAt: evalDatasets.updatedAt,
      })
      .from(evalDatasets)
      .where(
        and(
          eq(evalDatasets.userId, this.userId),
          eq(evalDatasets.knowledgeBaseId, knowledgeBaseId),
        ),
      )
      .orderBy(desc(evalDatasets.createdAt));
  };

  findById = async (id: number) => {
    return serverDB.query.evalDatasets.findFirst({
      where: and(eq(evalDatasets.id, id), eq(evalDatasets.userId, this.userId)),
    });
  };

  update = async (id: number, value: Partial<NewEvalDatasetsItem>) => {
    return serverDB
      .update(evalDatasets)
      .set({ ...value, updatedAt: new Date() })
      .where(and(eq(evalDatasets.id, id), eq(evalDatasets.userId, this.userId)));
  };
}
