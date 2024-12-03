import { and, desc, eq } from 'drizzle-orm/expressions';

import { serverDB } from '@/database/server';

import { InstalledPluginItem, NewInstalledPlugin, installedPlugins } from '../../schemas';

export class PluginModel {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  create = async (
    params: Pick<NewInstalledPlugin, 'type' | 'identifier' | 'manifest' | 'customParams'>,
  ) => {
    const [result] = await serverDB
      .insert(installedPlugins)
      .values({ ...params, createdAt: new Date(), updatedAt: new Date(), userId: this.userId })
      .returning();

    return result;
  };

  delete = async (id: string) => {
    return serverDB
      .delete(installedPlugins)
      .where(and(eq(installedPlugins.identifier, id), eq(installedPlugins.userId, this.userId)));
  };

  deleteAll = async () => {
    return serverDB.delete(installedPlugins).where(eq(installedPlugins.userId, this.userId));
  };

  query = async () => {
    return serverDB
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
    return serverDB.query.installedPlugins.findFirst({
      where: and(eq(installedPlugins.identifier, id), eq(installedPlugins.userId, this.userId)),
    });
  };

  async update(id: string, value: Partial<InstalledPluginItem>) {
    return serverDB
      .update(installedPlugins)
      .set({ ...value, updatedAt: new Date() })
      .where(and(eq(installedPlugins.identifier, id), eq(installedPlugins.userId, this.userId)));
  }
}
