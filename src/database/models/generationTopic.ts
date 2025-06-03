import { desc, eq } from 'drizzle-orm/expressions';

import { LobeChatDatabase } from '@/database/type';
import { ImageGenerationTopic } from '@/types/generation';

import { generationTopics } from '../schemas/generation';

export class GenerationTopicModel {
  private userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  queryAll = async () => {
    return (
      this.db
        .select()
        .from(generationTopics)
        // 按照最后更新时间排序, 这里的更新应该包括用户点击生成按钮
        .orderBy(desc(generationTopics.updatedAt))
        .where(eq(generationTopics.userId, this.userId))
    );
  };

  create = async (title: string) => {
    const [newGenerationTopic] = await this.db
      .insert(generationTopics)
      .values({
        userId: this.userId,
        title,
      })
      .returning();

    return newGenerationTopic;
  };

  update = async (id: string, data: Partial<ImageGenerationTopic>) => {
    const [updatedTopic] = await this.db
      .update(generationTopics)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(generationTopics.id, id))
      .returning();

    return updatedTopic;
  };

  delete = async (id: string) => {
    const [deletedTopic] = await this.db
      .delete(generationTopics)
      .where(eq(generationTopics.id, id))
      .returning();

    return deletedTopic;
  };
}
