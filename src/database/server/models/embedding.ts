import { count, eq } from 'drizzle-orm';
import { and } from 'drizzle-orm/expressions';

import { serverDB } from '@/database/server';

import { NewEmbeddingsItem, embeddings } from '../../schemas';

export class EmbeddingModel {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  create = async (value: Omit<NewEmbeddingsItem, 'userId'>) => {
    const [item] = await serverDB
      .insert(embeddings)
      .values({ ...value, userId: this.userId })
      .returning();

    return item.id as string;
  };

  bulkCreate = async (values: Omit<NewEmbeddingsItem, 'userId'>[]) => {
    return serverDB
      .insert(embeddings)
      .values(values.map((item) => ({ ...item, userId: this.userId })))
      .onConflictDoNothing({
        target: [embeddings.chunkId],
      });
  };

  delete = async (id: string) => {
    return serverDB
      .delete(embeddings)
      .where(and(eq(embeddings.id, id), eq(embeddings.userId, this.userId)));
  };

  query = async () => {
    return serverDB.query.embeddings.findMany({
      where: eq(embeddings.userId, this.userId),
    });
  };

  findById = async (id: string) => {
    return serverDB.query.embeddings.findFirst({
      where: and(eq(embeddings.id, id), eq(embeddings.userId, this.userId)),
    });
  };

  countUsage = async () => {
    const result = await serverDB
      .select({
        count: count(),
      })
      .from(embeddings)
      .where(eq(embeddings.userId, this.userId));

    return result[0].count;
  };
}
