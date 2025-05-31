import { eq } from 'drizzle-orm/expressions';

import { LobeChatDatabase } from '@/database/type';

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
        .orderBy(generationTopics.updatedAt)
        .where(eq(generationTopics.userId, this.userId))
    );
  };

  create = async () => {
    const [newGenerationTopic] = await this.db
      .insert(generationTopics)
      .values({
        userId: this.userId,
      })
      .returning();

    return newGenerationTopic;
  };
}
