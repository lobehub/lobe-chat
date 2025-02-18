import { and, desc, eq } from 'drizzle-orm/expressions';

import { LobeChatDatabase } from '@/database/type';

import { InstalledPluginItem, NewInstalledPlugin, installedPlugins } from '../../schemas';

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
      .insert(installedPlugins)
      .values({ ...params, createdAt: new Date(), updatedAt: new Date(), userId: this.userId })
      .onConflictDoUpdate({
        set: { ...params, updatedAt: new Date() },
        target: [installedPlugins.identifier, installedPlugins.userId],
      })
      .returning();

    return result;
  };

  delete = async (id: string) => {
    return this.db
      .delete(installedPlugins)
      .where(and(eq(installedPlugins.identifier, id), eq(installedPlugins.userId, this.userId)));
  };

  deleteAll = async () => {
    return this.db.delete(installedPlugins).where(eq(installedPlugins.userId, this.userId));
  };

  query = async () => {
    return this.db
      .select({
        createdAt: installedPlugins.createdAt,
        customParams: installedPlugins.customParams,
        identifier: installedPlugins.identifier,
        manifest: installedPlugins.manifest,
        settings: installedPlugins.settings,
        type: installedPlugins.type,
        updatedAt: installedPlugins.updatedAt,
      })
      .from(installedPlugins)
      .where(eq(installedPlugins.userId, this.userId))
      .orderBy(desc(installedPlugins.createdAt));
  };

  findById = async (id: string) => {
    return this.db.query.installedPlugins.findFirst({
      where: and(eq(installedPlugins.identifier, id), eq(installedPlugins.userId, this.userId)),
    });
  };

  update = async (id: string, value: Partial<InstalledPluginItem>) => {
    return this.db
      .update(installedPlugins)
      .set({ ...value, updatedAt: new Date() })
      .where(and(eq(installedPlugins.identifier, id), eq(installedPlugins.userId, this.userId)));
  };
}
