import { and, desc, eq } from 'drizzle-orm';

import { DocumentItem, NewDocument, documents } from '../schemas';
import { LobeChatDatabase } from '../type';

export class DocumentModel {
  private userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  create = async (params: Omit<NewDocument, 'userId'>): Promise<DocumentItem> => {
    const result = (await this.db
      .insert(documents)
      .values({ ...params, userId: this.userId })
      .returning()) as DocumentItem[];

    return result[0]!;
  };

  delete = async (id: string) => {
    return this.db
      .delete(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, this.userId)));
  };

  deleteAll = async () => {
    return this.db.delete(documents).where(eq(documents.userId, this.userId));
  };

  query = async (): Promise<DocumentItem[]> => {
    return this.db.query.documents.findMany({
      orderBy: [desc(documents.updatedAt)],
      where: eq(documents.userId, this.userId),
    });
  };

  findById = async (id: string): Promise<DocumentItem | undefined> => {
    return this.db.query.documents.findFirst({
      where: and(eq(documents.userId, this.userId), eq(documents.id, id)),
    });
  };

  findByFileId = async (fileId: string) => {
    return this.db.query.documents.findFirst({
      where: and(eq(documents.userId, this.userId), eq(documents.fileId, fileId)),
    });
  };

  update = async (id: string, value: Partial<DocumentItem>) => {
    return this.db
      .update(documents)
      .set({ ...value, updatedAt: new Date() })
      .where(and(eq(documents.userId, this.userId), eq(documents.id, id)));
  };
}
