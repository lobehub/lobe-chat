import { and, desc, eq } from 'drizzle-orm/expressions';

import { LobeChatDatabase } from '@/database/type';
import { FileService } from '@/server/services/file';
import { ImageGenerationTopic } from '@/types/generation';

import { generationTopics } from '../schemas/generation';

export class GenerationTopicModel {
  private userId: string;
  private db: LobeChatDatabase;
  private fileService: FileService;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
    this.fileService = new FileService(db, userId);
  }

  queryAll = async () => {
    const topics = await this.db
      .select()
      .from(generationTopics)
      .orderBy(desc(generationTopics.updatedAt))
      .where(eq(generationTopics.userId, this.userId));

    return Promise.all(
      topics.map(async (topic) => {
        if (topic.coverUrl) {
          return {
            ...topic,
            coverUrl: await this.fileService.getFullFileUrl(topic.coverUrl),
          };
        }
        return topic;
      }),
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
      .where(and(eq(generationTopics.id, id), eq(generationTopics.userId, this.userId)))
      .returning();

    return updatedTopic;
  };

  delete = async (id: string) => {
    const [deletedTopic] = await this.db
      .delete(generationTopics)
      .where(and(eq(generationTopics.id, id), eq(generationTopics.userId, this.userId)))
      .returning();

    return deletedTopic;
  };
}
