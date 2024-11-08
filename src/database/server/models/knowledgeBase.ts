import { eq, inArray } from 'drizzle-orm';
import { and, desc } from 'drizzle-orm/expressions';

import { serverDB } from '@/database/server';
import { KnowledgeBaseItem } from '@/types/knowledgeBase';

import { NewKnowledgeBase, knowledgeBaseFiles, knowledgeBases } from '../schemas/lobechat';

export class KnowledgeBaseModel {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // create

  create = async (params: Omit<NewKnowledgeBase, 'userId'>) => {
    const [result] = await serverDB
      .insert(knowledgeBases)
      .values({ ...params, userId: this.userId })
      .returning();

    return result;
  };

  addFilesToKnowledgeBase = async (id: string, fileIds: string[]) => {
    return serverDB
      .insert(knowledgeBaseFiles)
      .values(fileIds.map((fileId) => ({ fileId, knowledgeBaseId: id, userId: this.userId })))
      .returning();
  };

  // delete
  delete = async (id: string) => {
    return serverDB
      .delete(knowledgeBases)
      .where(and(eq(knowledgeBases.id, id), eq(knowledgeBases.userId, this.userId)));
  };

  deleteAll = async () => {
    return serverDB.delete(knowledgeBases).where(eq(knowledgeBases.userId, this.userId));
  };

  removeFilesFromKnowledgeBase = async (knowledgeBaseId: string, ids: string[]) => {
    return serverDB.delete(knowledgeBaseFiles).where(
      and(
        eq(knowledgeBaseFiles.knowledgeBaseId, knowledgeBaseId),
        inArray(knowledgeBaseFiles.fileId, ids),
        // eq(knowledgeBaseFiles.userId, this.userId),
      ),
    );
  };
  // query
  query = async () => {
    const data = await serverDB
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
    return serverDB.query.knowledgeBases.findFirst({
      where: and(eq(knowledgeBases.id, id), eq(knowledgeBases.userId, this.userId)),
    });
  };

  // update
  async update(id: string, value: Partial<KnowledgeBaseItem>) {
    return serverDB
      .update(knowledgeBases)
      .set({ ...value, updatedAt: new Date() })
      .where(and(eq(knowledgeBases.id, id), eq(knowledgeBases.userId, this.userId)));
  }

  static async findById(id: string) {
    return serverDB.query.knowledgeBases.findFirst({
      where: eq(knowledgeBases.id, id),
    });
  }
}
