import { and, eq, inArray } from 'drizzle-orm';
import pMap from 'p-map';

import * as EXPORT_TABLES from '../../schemas';
import { LobeChatDatabase } from '../../type';

interface BaseTableConfig {
  table: keyof typeof EXPORT_TABLES;
  type: 'base';
  userField?: string;
}

export interface RelationTableConfig {
  relations: {
    field: string;
    sourceField?: string;
    sourceTable: keyof typeof EXPORT_TABLES;
  }[];
  table: keyof typeof EXPORT_TABLES;
  type: 'relation';
}

export const DATA_EXPORT_CONFIG = {
  baseTables: [
    // { table: 'users', userField: 'id' },
    { table: 'userSettings', userField: 'id' },
    { table: 'userInstalledPlugins' },
    { table: 'agents' },
    // { table: 'agentsFiles' },
    // { table: 'agentsKnowledgeBases' },
    // { table: 'agentsToSessions' },
    { table: 'aiModels' },
    { table: 'aiProviders' },
    // async tasks should not be included
    // { table: 'asyncTasks' },
    // { table: 'chunks' },
    // { table: 'unstructuredChunks' },
    // { table: 'embeddings' },
    // { table: 'files' },
    // { table: 'fileChunks' },
    // { table: 'filesToSessions' },
    // { table: 'knowledgeBases' },
    // { table: 'knowledgeBaseFiles' },
    { table: 'messageChunks' },
    { table: 'messagePlugins' },
    // { table: 'messageQueryChunks' },
    // { table: 'messageQueries' },
    { table: 'messageTranslates' },
    // { table: 'messageTTS' },
    { table: 'messages' },
    // { table: 'messagesFiles' },

    // next auth tables won't be included
    // { table: 'nextauthAccounts' },
    // { table: 'nextauthSessions' },
    // { table: 'nextauthAuthenticators' },
    // { table: 'nextauthVerificationTokens' },
    { table: 'sessionGroups' },
    { table: 'sessions' },
    { table: 'threads' },
    { table: 'topics' },
  ] as BaseTableConfig[],
  relationTables: [
    // {
    //   relations: [{ field: 'hashId', sourceField: 'fileHash', sourceTable: 'files' }],
    //   table: 'globalFiles',
    // },
    {
      relations: [
        { field: 'agentId', sourceField: 'id', sourceTable: 'agents' },
        { field: 'sessionId', sourceField: 'id', sourceTable: 'sessions' },
      ],
      table: 'agentsToSessions',
    },

    // {
    //   relations: [{ field: 'id', sourceField: 'id', sourceTable: 'messages' }],
    //   table: 'messagePlugins',
    // },
  ] as RelationTableConfig[],
};

export class DataExporterRepos {
  private userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.db = db;
    this.userId = userId;
  }

  private removeUserId(data: any[]) {
    return data.map((item) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { userId: _, ...rest } = item;
      return rest;
    });
  }

  private async queryTable(config: RelationTableConfig, existingData: Record<string, any[]>) {
    const { table } = config;
    const tableObj = EXPORT_TABLES[table];
    if (!tableObj) throw new Error(`Table ${table} not found`);

    try {
      const conditions = [];

      // 处理每个关联条件
      for (const relation of config.relations) {
        const sourceData = existingData[relation.sourceTable] || [];

        // 如果源数据为空，这个表可能无法查询到任何数据
        if (sourceData.length === 0) {
          console.log(
            `Source table ${relation.sourceTable} has no data, skipping query for ${table}`,
          );
          return [];
        }

        const sourceIds = sourceData.map((item) => item[relation.sourceField || 'id']);
        conditions.push(inArray(tableObj[relation.field], sourceIds));
      }

      // 如果表有userId字段并且不是users表，添加用户过滤
      if ('userId' in tableObj && table !== 'users' && !config.relations) {
        conditions.push(eq(tableObj.userId, this.userId));
      }

      // 组合所有条件
      const where = conditions.length === 1 ? conditions[0] : and(...conditions);

      // @ts-expect-error query
      const result = await this.db.query[table].findMany({ where });

      // 只对使用 userId 查询的表移除 userId 字段
      console.log(`Successfully exported table: ${table}, count: ${result.length}`);
      return config.relations ? result : this.removeUserId(result);
    } catch (error) {
      console.error(`Error querying table ${table}:`, error);
      return [];
    }
  }

  private async queryBaseTables(config: BaseTableConfig) {
    const { table } = config;
    const tableObj = EXPORT_TABLES[table];
    if (!tableObj) throw new Error(`Table ${table} not found`);

    try {
      // 如果有关联配置，使用关联查询

      // 默认使用 userId 查询，特殊情况使用 userField
      const userField = config.userField || 'userId';
      const where = eq(tableObj[userField], this.userId);

      // @ts-expect-error query
      const result = await this.db.query[table].findMany({ where });

      // 只对使用 userId 查询的表移除 userId 字段
      console.log(`Successfully exported table: ${table}, count: ${result.length}`);
      return this.removeUserId(result);
    } catch (error) {
      console.error(`Error querying table ${table}:`, error);
      return [];
    }
  }

  async export(concurrency = 10) {
    const result: Record<string, any[]> = {};

    // 1. 首先并发查询所有基础表
    console.log('Querying base tables...');
    const baseResults = await pMap(
      DATA_EXPORT_CONFIG.baseTables,
      async (config) => ({ data: await this.queryBaseTables(config), table: config.table }),
      { concurrency },
    );

    // 更新结果集
    baseResults.forEach(({ table, data }) => {
      result[table] = data;
    });

    // 2. 然后并发查询所有关联表

    const relationResults = await pMap(
      DATA_EXPORT_CONFIG.relationTables,
      async (config) => {
        // 检查所有依赖的源表是否有数据
        const allSourcesHaveData = config.relations.every(
          (relation) => (result[relation.sourceTable] || []).length > 0,
        );

        if (!allSourcesHaveData) {
          console.log(`Skipping table ${config.table} as some source tables have no data`);
          return { data: [], table: config.table };
        }

        return {
          data: await this.queryTable(config, result),
          table: config.table,
        };
      },
      { concurrency },
    );

    // 更新结果集
    relationResults.forEach(({ table, data }) => {
      result[table] = data;
    });

    console.log('finalResults:', result);

    return result;
  }
}
