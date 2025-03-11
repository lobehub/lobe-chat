import { and, desc, eq } from 'drizzle-orm/expressions';

import { LobeChatDatabase } from '@/database/type';

import { InstalledPluginItem, NewInstalledPlugin, userInstalledPlugins } from '../../schemas';

export class PluginModel {
  private userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  create = async (
    params: Pick<NewInstalledPlugin, 'type' | 'identifier' | 'manifest' | 'customParams'>,
  ) => {
    const [result] = await this.db
      .insert(userInstalledPlugins)
      .values({ ...params, createdAt: new Date(), updatedAt: new Date(), userId: this.userId })
      .onConflictDoUpdate({
        set: { ...params, updatedAt: new Date() },
        target: [userInstalledPlugins.identifier, userInstalledPlugins.userId],
      })
      .returning();

    return result;
  };

  delete = async (id: string) => {
    return this.db
      .delete(userInstalledPlugins)
      .where(and(eq(userInstalledPlugins.identifier, id), eq(userInstalledPlugins.userId, this.userId)));
  };

  deleteAll = async () => {
    return this.db.delete(userInstalledPlugins).where(eq(userInstalledPlugins.userId, this.userId));
  };

  query = async () => {
    return this.db
      .select({
        createdAt: userInstalledPlugins.createdAt,
        customParams: userInstalledPlugins.customParams,
        identifier: userInstalledPlugins.identifier,
        manifest: userInstalledPlugins.manifest,
        settings: userInstalledPlugins.settings,
        type: userInstalledPlugins.type,
        updatedAt: userInstalledPlugins.updatedAt,
      })
      .from(userInstalledPlugins)
      .where(eq(userInstalledPlugins.userId, this.userId))
      .orderBy(desc(userInstalledPlugins.createdAt));
  };

  findById = async (id: string) => {
    return this.db.query.userInstalledPlugins.findFirst({
      where: and(eq(userInstalledPlugins.identifier, id), eq(userInstalledPlugins.userId, this.userId)),
    });
  };

  update = async (id: string, value: Partial<InstalledPluginItem>) => {
    return this.db
      .update(userInstalledPlugins)
      .set({ ...value, updatedAt: new Date() })
      .where(and(eq(userInstalledPlugins.identifier, id), eq(userInstalledPlugins.userId, this.userId)));
  };
}
