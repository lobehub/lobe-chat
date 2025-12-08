import { and, desc, eq } from 'drizzle-orm';

import {
  NewUserMemoryIdentity,
  UserMemoryIdentity,
  userMemories,
  userMemoriesIdentities,
} from '../../schemas';
import { LobeChatDatabase } from '../../type';

export class UserMemoryIdentityModel {
  private userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  create = async (params: Omit<NewUserMemoryIdentity, 'userId'>) => {
    const [result] = await this.db
      .insert(userMemoriesIdentities)
      .values({ ...params, userId: this.userId })
      .returning();

    return result;
  };

  delete = async (id: string) => {
    return this.db.transaction(async (tx) => {
      const identity = await tx.query.userMemoriesIdentities.findFirst({
        where: and(
          eq(userMemoriesIdentities.id, id),
          eq(userMemoriesIdentities.userId, this.userId),
        ),
      });

      if (!identity || !identity.userMemoryId) {
        return { success: false };
      }

      // Delete the base user memory (cascade will handle the identity)
      await tx
        .delete(userMemories)
        .where(
          and(eq(userMemories.id, identity.userMemoryId), eq(userMemories.userId, this.userId)),
        );

      return { success: true };
    });
  };

  deleteAll = async () => {
    return this.db
      .delete(userMemoriesIdentities)
      .where(eq(userMemoriesIdentities.userId, this.userId));
  };

  query = async (limit = 50) => {
    return this.db.query.userMemoriesIdentities.findMany({
      limit,
      orderBy: [desc(userMemoriesIdentities.createdAt)],
      where: eq(userMemoriesIdentities.userId, this.userId),
    });
  };

  findById = async (id: string) => {
    return this.db.query.userMemoriesIdentities.findFirst({
      where: and(eq(userMemoriesIdentities.id, id), eq(userMemoriesIdentities.userId, this.userId)),
    });
  };

  update = async (id: string, value: Partial<UserMemoryIdentity>) => {
    return this.db
      .update(userMemoriesIdentities)
      .set({ ...value, updatedAt: new Date() })
      .where(
        and(eq(userMemoriesIdentities.id, id), eq(userMemoriesIdentities.userId, this.userId)),
      );
  };
}
