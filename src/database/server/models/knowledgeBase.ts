import { and, desc, eq, inArray } from 'drizzle-orm/expressions';

import { LobeChatDatabase } from '@/database/type';
import { KnowledgeBaseItem } from '@/types/knowledgeBase';

import { NewKnowledgeBase, knowledgeBaseFiles, knowledgeBases } from '../../schemas';

export class KnowledgeBaseModel {
  private userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  // create

  create = async (params: Omit<NewKnowledgeBase, 'userId'>) => {
    const [result] = await this.db
      .insert(knowledgeBases)
      .values({ ...params, userId: this.userId })
      .returning();

    return result;
  };

  addFilesToKnowledgeBase = async (id: string, fileIds: string[]) => {
    return this.db
      .insert(knowledgeBaseFiles)
      .values(fileIds.map((fileId) => ({ fileId, knowledgeBaseId: id, userId: this.userId })))
      .returning();
  };

  // delete
  delete = async (id: string) => {
    return this.db
      .delete(knowledgeBases)
      .where(and(eq(knowledgeBases.id, id), eq(knowledgeBases.userId, this.userId)));
  };

  deleteAll = async () => {
    return this.db.delete(knowledgeBases).where(eq(knowledgeBases.userId, this.userId));
  };

  removeFilesFromKnowledgeBase = async (knowledgeBaseId: string, ids: string[]) => {
    return this.db.delete(knowledgeBaseFiles).where(
      and(
        eq(knowledgeBaseFiles.knowledgeBaseId, knowledgeBaseId),
        inArray(knowledgeBaseFiles.fileId, ids),
        // eq(knowledgeBaseFiles.userId, this.userId),
      ),
    );
  };
  // query
  query = async () => {
    const data = await this.db
      .select({
        avatar: knowledgeBases.avatar,
        createdAt: knowledgeBases.createdAt,
        description: knowledgeBases.description,
        id: knowledgeBases.id,
        isPublic: knowledgeBases.isPublic,
        name: knowledgeBases.name,
        settings: knowledgeBases.settings,
        type: knowledgeBases.type,
        updatedAt: knowledgeBases.updatedAt,
      })
      .from(knowledgeBases)
      .where(eq(knowledgeBases.userId, this.userId))
      .orderBy(desc(knowledgeBases.updatedAt));

    return data as KnowledgeBaseItem[];
  };

  findById = async (id: string) => {
    return this.db.query.knowledgeBases.findFirst({
      where: and(eq(knowledgeBases.id, id), eq(knowledgeBases.userId, this.userId)),
    });
  };

  // update
  async update(id: string, value: Partial<KnowledgeBaseItem>) {
    return this.db
      .update(knowledgeBases)
      .set({ ...value, updatedAt: new Date() })
      .where(and(eq(knowledgeBases.id, id), eq(knowledgeBases.userId, this.userId)));
  }

  static async findById(db: LobeChatDatabase, id: string) {
    return db.query.knowledgeBases.findFirst({
      where: eq(knowledgeBases.id, id),
    });
  }
}
