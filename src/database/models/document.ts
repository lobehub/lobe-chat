import { and, desc, eq } from 'drizzle-orm';

import { LobeChatDatabase } from '@/database/type';

import { DocumentItem, NewDocument, documents } from '../schemas';

export class DocumentModel {
  private userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  create = async (params: Omit<NewDocument, 'userId'>) => {
    const [result] = await this.db
      .insert(documents)
      .values({ ...params, userId: this.userId })
      .returning();

    return result;
  };

  delete = async (id: string) => {
    return this.db
      .delete(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, this.userId)));
  };

  deleteAll = async () => {
    return this.db.delete(documents).where(eq(documents.userId, this.userId));
  };

  query = async () => {
    return this.db.query.documents.findMany({
      orderBy: [desc(documents.updatedAt)],
      where: eq(documents.userId, this.userId),
    });
  };

  findById = async (id: string) => {
    return this.db.query.documents.findFirst({
      where: and(eq(documents.id, id), eq(documents.userId, this.userId)),
    });
  };

  update = async (id: string, value: Partial<DocumentItem>) => {
    return this.db
      .update(documents)
      .set({ ...value, updatedAt: new Date() })
      .where(and(eq(documents.id, id), eq(documents.userId, this.userId)));
  };
}
