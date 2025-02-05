import { and, eq, inArray } from 'drizzle-orm/expressions';
import pMap from 'p-map';

import * as EXPORT_TABLES from '@/database/schemas';
import { LobeChatDatabase } from '@/database/type';

interface BaseTableConfig {
  table: keyof typeof EXPORT_TABLES;
  type: 'base';
  userField?: string;
}

interface RelationTableConfig {
  relations: {
    field: string;
    sourceField?: string;
    sourceTable: string;
  }[];
  table: keyof typeof EXPORT_TABLES;
  type: 'relation';
}

// 配置拆分为基础表和关联表

export const DATA_EXPORT_CONFIG = {
  // 1. 基础表
  baseTables: [
    { table: 'users', userField: 'id' },
    { table: 'userSettings', userField: 'id' },
    { table: 'userInstalledPlugins' },
    { table: 'agents' },
    { table: 'sessionGroups' },
    { table: 'sessions' },
    { table: 'topics' },
    { table: 'threads' },
    { table: 'messages' },
    { table: 'files' },
    { table: 'knowledgeBases' },
    { table: 'agentsKnowledgeBases' },
    { table: 'aiProviders' },
    { table: 'aiModels' },
    { table: 'asyncTasks' },
    { table: 'chunks' },
    { table: 'embeddings' },
  ] as BaseTableConfig[],
  // 2. 关联表
  relationTables: [
    {
      relations: [
        { sourceField: 'id', sourceTable: 'agents', field: 'agentId' },
        { sourceField: 'sessionId', sourceTable: 'sessions' },
      ],
      table: 'agentsToSessions',
    },
    // {
    //   relations: [
    //     { sourceField: 'agentId', sourceTable: 'agents' },
    //     { sourceField: 'fileId', sourceTable: 'files' },
    //   ],
    //   table: 'agentsFiles',
    // },
    // {
    //   relations: [{ field: 'sessionId', sourceTable: 'sessions' }],
    //   table: 'filesToSessions',
    // },
    // {
    //   relations: [{ field: 'id', sourceTable: 'chunks' }],
    //   table: 'fileChunks',
    // },
    {
      relations: [{ field: 'id', sourceTable: 'messages' }],
      table: 'messagePlugins',
    },
    {
      relations: [{ field: 'id', sourceTable: 'messages' }],
      table: 'messageTTS',
    },
    {
      relations: [{ field: 'id', sourceTable: 'messages' }],
      table: 'messageTranslates',
    },
    {
      relations: [
        { field: 'messageId', sourceTable: 'messages' },
        { field: 'fileId', sourceTable: 'files' },
      ],
      table: 'messagesFiles',
    },
    {
      relations: [{ field: 'messageId', sourceTable: 'messages' }],
      table: 'messageQueries',
    },
    {
      relations: [
        { field: 'messageId', sourceTable: 'messages' },
        { field: 'chunkId', sourceTable: 'chunks' },
      ],
      table: 'messageQueryChunks',
    },
    {
      relations: [
        { field: 'messageId', sourceTable: 'messages' },
        { field: 'chunkId', sourceTable: 'chunks' },
      ],
      table: 'messageChunks',
    },
    {
      relations: [
        { field: 'knowledgeBaseId', sourceTable: 'knowledgeBases' },
        { field: 'fileId', sourceTable: 'files' },
      ],
      table: 'knowledgeBaseFiles',
    },
  ] as RelationTableConfig[],
};

export class DataExporterRepos {
  constructor(
    private db: LobeChatDatabase,
    private userId: string,
  ) {}

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
      let where;

      const conditions = config.relations.map((relation) => {
        const sourceData = existingData[relation.sourceTable] || [];

        const sourceIds = sourceData.map((item) => item[relation.sourceField || 'id']);
        console.log(sourceIds);
        return inArray(tableObj[relation.field], sourceIds);
      });

      where = conditions.length === 1 ? conditions[0] : and(...conditions);

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

    console.log('baseResults:', baseResults);
    // 2. 然后并发查询所有关联表

    console.log('Querying relation tables...');
    const relationResults = await pMap(
      DATA_EXPORT_CONFIG.relationTables,
      async (config) => ({
        data: await this.queryTable(config, result),
        table: config.table,
      }),
      { concurrency },
    );

    // 更新结果集
    relationResults.forEach(({ table, data }) => {
      result[table] = data;
    });

    return result;
  }
}
