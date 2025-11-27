import type { ImportPgDataStructure, ImportResultData, ImporterEntryData } from '@lobechat/types';
import { and, eq, inArray } from 'drizzle-orm';

import { uuid } from '@/utils/uuid';

import * as EXPORT_TABLES from '../../schemas';
import { LobeChatDatabase } from '../../type';
import { DeprecatedDataImporterRepos } from './deprecated';

interface ImportResult {
  added: number;
  errors: number;
  skips: number;
  updated?: number;
}

type ConflictStrategy = 'skip' | 'override' | 'merge';

interface TableImportConfig {
  // Conflict resolution strategy
  conflictStrategy?: ConflictStrategy;
  // Field processing functions
  fieldProcessors?: {
    [field: string]: (value: any) => any;
  };
  // Whether to use composite key (no separate id field)
  isCompositeKey?: boolean;
  // Whether to preserve original ID
  preserveId?: boolean;
  // Relation field definitions
  relations?: {
    field: string;
    sourceField?: string;
    sourceTable: string;
  }[];
  // Self-reference fields
  selfReferences?: {
    field: string;
    sourceField?: string;
  }[];
  // Table name
  table: string;
  // Unique constraint fields
  uniqueConstraints?: string[];
}

// Import table configuration
const IMPORT_TABLE_CONFIG: TableImportConfig[] = [
  {
    conflictStrategy: 'merge',
    preserveId: true,
    // Special table, ID same as user ID
    table: 'userSettings',
    uniqueConstraints: ['id'],
  },
  {
    conflictStrategy: 'merge',
    isCompositeKey: true,
    table: 'userInstalledPlugins',
    uniqueConstraints: ['identifier'],
  },
  {
    conflictStrategy: 'skip',
    preserveId: true,
    table: 'aiProviders',
    uniqueConstraints: ['id'],
  },
  {
    conflictStrategy: 'skip',
    preserveId: true, // 需要保留原始ID
    relations: [
      {
        field: 'providerId',
        sourceTable: 'aiProviders',
      },
    ],
    table: 'aiModels',
    uniqueConstraints: ['id', 'providerId'],
  },
  {
    table: 'sessionGroups',
    uniqueConstraints: [],
  },
  {
    fieldProcessors: {
      slug: (value) => (value ? `${value}-${uuid().slice(0, 8)}` : null),
    },
    table: 'agents',
    uniqueConstraints: ['slug'],
  },
  {
    // 对slug字段进行特殊处理
    fieldProcessors: {
      slug: (value) => `${value}-${uuid().slice(0, 8)}`,
    },
    relations: [
      {
        field: 'groupId',
        sourceTable: 'sessionGroups',
      },
    ],
    table: 'sessions',
    uniqueConstraints: ['slug'],
  },
  {
    relations: [
      {
        field: 'sessionId',
        sourceTable: 'sessions',
      },
    ],
    table: 'topics',
  },
  {
    conflictStrategy: 'skip',
    isCompositeKey: true, // 使用复合主键 [agentId, sessionId]
    relations: [
      {
        field: 'agentId',
        sourceTable: 'agents',
      },
      {
        field: 'sessionId',
        sourceTable: 'sessions',
      },
    ],
    table: 'agentsToSessions',
    uniqueConstraints: ['agentId', 'sessionId'],
  },
  {
    relations: [
      {
        field: 'topicId',
        sourceTable: 'topics',
      },
    ],
    selfReferences: [
      {
        field: 'parentThreadId',
      },
    ],
    table: 'threads',
  },
  {
    relations: [
      {
        field: 'sessionId',
        sourceTable: 'sessions',
      },
      {
        field: 'topicId',
        sourceTable: 'topics',
      },
      {
        field: 'agentId',
        sourceTable: 'agents',
      },
      {
        field: 'threadId',
        sourceTable: 'threads',
      },
    ],
    selfReferences: [
      {
        field: 'parentId',
      },
      {
        field: 'quotaId',
      },
    ],
    table: 'messages',
  },
  {
    conflictStrategy: 'skip',
    preserveId: true, // 使用消息ID作为主键
    relations: [
      {
        field: 'id',
        sourceTable: 'messages',
      },
    ],
    table: 'messagePlugins',
  },
  {
    isCompositeKey: true, // 使用复合主键 [messageId, chunkId]
    relations: [
      {
        field: 'messageId',
        sourceTable: 'messages',
      },
      {
        field: 'chunkId',
        sourceTable: 'chunks',
      },
    ],
    table: 'messageChunks',
  },
  {
    isCompositeKey: true, // 使用复合主键 [id, queryId, chunkId]
    relations: [
      {
        field: 'id',
        sourceTable: 'messages',
      },
      {
        field: 'queryId',
        sourceTable: 'messageQueries',
      },
      {
        field: 'chunkId',
        sourceTable: 'chunks',
      },
    ],
    table: 'messageQueryChunks',
  },
  // {
  //   relations: [
  //     {
  //       field: 'messageId',
  //       sourceTable: 'messages',
  //     },
  //     {
  //       field: 'embeddingsId',
  //       sourceTable: 'embeddings',
  //     },
  //   ],
  //   table: 'messageQueries',
  // },
  {
    conflictStrategy: 'skip',
    preserveId: true, // 使用消息ID作为主键
    relations: [
      {
        field: 'id',
        sourceTable: 'messages',
      },
    ],
    table: 'messageTranslates',
  },
  // {
  //   conflictStrategy: 'skip',
  //   preserveId: true, // 使用消息ID作为主键
  //   relations: [
  //     {
  //       field: 'id',
  //       sourceTable: 'messages',
  //     },
  //     {
  //       field: 'fileId',
  //       sourceTable: 'files',
  //     },
  //   ],
  //   table: 'messageTTS',
  // },
];

export class DataImporterRepos {
  private userId: string;
  private db: LobeChatDatabase;
  private deprecatedDataImporterRepos: DeprecatedDataImporterRepos;
  private idMaps: Record<string, Record<string, string>> = {};
  private conflictRecords: Record<string, { field: string; value: any }[]> = {};

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
    this.deprecatedDataImporterRepos = new DeprecatedDataImporterRepos(db, userId);
  }

  importData = async (data: ImporterEntryData): Promise<ImportResultData> => {
    const results = await this.deprecatedDataImporterRepos.importData(data);
    return { results, success: true };
  };

  /**
   * 导入PostgreSQL数据
   */
  async importPgData(
    dbData: ImportPgDataStructure,
    conflictStrategy: ConflictStrategy = 'skip',
  ): Promise<ImportResultData> {
    const results: Record<string, ImportResult> = {};
    const { data } = dbData;

    // 初始化ID映射表和冲突记录
    this.idMaps = {};
    this.conflictRecords = {};

    try {
      await this.db.transaction(async (trx) => {
        // 按配置顺序导入表
        for (const config of IMPORT_TABLE_CONFIG) {
          const { table: tableName } = config;

          // @ts-ignore
          const tableData = data[tableName];

          if (!tableData || tableData.length === 0) {
            continue;
          }

          // 使用统一的导入方法
          const result = await this.importTableData(trx, config, tableData, conflictStrategy);
          console.log(`imported table: ${tableName}, records: ${tableData.length}`);

          if (Object.values(result).some((value) => value > 0)) {
            results[tableName] = result;
          }
        }
      });

      return { results, success: true };
    } catch (error) {
      console.error('Import failed:', error);

      return {
        error: {
          details: this.extractErrorDetails(error),
          message: (error as any).message,
        },
        results,
        success: false,
      };
    }
  }

  /**
   * 从错误中提取详细信息
   */
  private extractErrorDetails(error: any) {
    if (error.code === '23505') {
      // PostgreSQL 唯一约束错误码
      const match = error.detail?.match(/Key \((.+?)\)=\((.+?)\) already exists/);
      if (match) {
        return {
          constraintType: 'unique',
          field: match[1],
          value: match[2],
        };
      }
    }

    return error.detail || 'Unknown error details';
  }

  /**
   * 统一的表数据导入函数 - 处理所有类型的表
   */
  private async importTableData(
    trx: any,
    config: TableImportConfig,
    tableData: any[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _userConflictStrategy: ConflictStrategy,
  ): Promise<ImportResult> {
    const {
      table: tableName,
      preserveId,
      isCompositeKey = false,
      uniqueConstraints = [],
      conflictStrategy = 'override',
      fieldProcessors = {},
      relations = [],
      selfReferences = [],
    } = config;

    // @ts-ignore
    const table = EXPORT_TABLES[tableName];
    const result: ImportResult = { added: 0, errors: 0, skips: 0, updated: 0 };

    // 初始化该表的ID映射
    if (!this.idMaps[tableName]) {
      this.idMaps[tableName] = {};
    }

    try {
      // 1. 查找已存在的记录（基于clientId和userId）
      let existingRecords: any[] = [];

      if ('clientId' in table && 'userId' in table) {
        const clientIds = tableData.map((item) => item.clientId || item.id).filter(Boolean);

        if (clientIds.length > 0) {
          existingRecords = await trx.query[tableName].findMany({
            where: and(eq(table.userId, this.userId), inArray(table.clientId, clientIds)),
          });
        }
      }

      // 如果需要保留原始ID，还需要检查ID是否已存在
      if (preserveId && !isCompositeKey) {
        const ids = tableData.map((item) => item.id).filter(Boolean);
        if (ids.length > 0) {
          const idExistingRecords = await trx.query[tableName].findMany({
            where: inArray(table.id, ids),
          });

          // 合并到已存在记录集合中
          existingRecords = [
            ...existingRecords,
            ...idExistingRecords.filter(
              (record: any) => !existingRecords.some((existing) => existing.id === record.id),
            ),
          ];
        }
      }

      result.skips = existingRecords.length;

      // 2. 为已存在的记录建立ID映射
      for (const record of existingRecords) {
        // 只有非复合主键表才需要ID映射
        if (!isCompositeKey) {
          this.idMaps[tableName][record.id] = record.id;
          if (record.clientId) {
            this.idMaps[tableName][record.clientId] = record.id;
          }

          // 记录中可能使用的任何其他ID标识符
          const originalRecord = tableData.find(
            (item) => item.id === record.id || item.clientId === record.clientId,
          );

          if (originalRecord) {
            // 确保原始记录ID也映射到数据库记录ID
            this.idMaps[tableName][originalRecord.id] = record.id;
          }
        }
      }

      // 3. 筛选出需要插入的记录
      const recordsToInsert = tableData.filter(
        (item) =>
          !existingRecords.some(
            (record) =>
              (record.clientId === (item.clientId || item.id) && record.clientId) ||
              (preserveId && !isCompositeKey && record.id === item.id),
          ),
      );

      if (recordsToInsert.length === 0) {
        return result;
      }

      // 4. 准备导入数据
      const preparedData = recordsToInsert.map((item) => {
        const originalId = item.id;

        // 处理日期字段
        const dateFields: any = {};
        if (item.createdAt) dateFields.createdAt = new Date(item.createdAt);
        if (item.updatedAt) dateFields.updatedAt = new Date(item.updatedAt);
        if (item.accessedAt) dateFields.accessedAt = new Date(item.accessedAt);

        // 创建新记录对象
        let newRecord: any = {};

        // 根据是否复合主键和是否保留ID决定如何处理
        if (isCompositeKey) {
          // 对于复合主键表，不包含id字段
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id: _, ...rest } = item;
          newRecord = {
            ...rest,
            ...dateFields,
            clientId: item.clientId || item.id,
            userId: this.userId,
          };
        } else {
          // 非复合主键表处理
          newRecord = {
            ...(preserveId ? item : { ...item, id: undefined }),
            ...dateFields,
            clientId: item.clientId || item.id,
            userId: this.userId,
          };
        }

        // 应用字段处理器
        for (const field in fieldProcessors) {
          if (newRecord[field] !== undefined) {
            newRecord[field] = fieldProcessors[field](newRecord[field]);
          }
        }

        // 特殊表处理
        if (tableName === 'userSettings') {
          newRecord.id = this.userId;
        }

        // 处理关系字段（外键引用）
        for (const relation of relations) {
          const { field, sourceTable } = relation;

          if (newRecord[field] && this.idMaps[sourceTable]) {
            const mappedId = this.idMaps[sourceTable][newRecord[field]];

            if (mappedId) {
              newRecord[field] = mappedId;
            } else {
              // 找不到映射，设为null
              console.warn(
                `Could not find mapped ID for ${field}=${newRecord[field]} in table ${sourceTable}`,
              );
              newRecord[field] = null;
            }
          }
        }

        // 简化处理自引用字段 - 直接设为null
        for (const selfRef of selfReferences) {
          const { field } = selfRef;
          if (newRecord[field] !== undefined) {
            newRecord[field] = null;
          }
        }

        return { newRecord, originalId };
      });

      // 5. 检查唯一约束并应用冲突策略
      for (const record of preparedData) {
        if (isCompositeKey && uniqueConstraints.length > 0) {
          // 对于复合主键表，将所有唯一约束字段作为一个组合条件
          const whereConditions = uniqueConstraints
            .filter((field) => record.newRecord[field] !== undefined)
            .map((field) => eq(table[field], record.newRecord[field]));

          // 添加userId条件（如果表有userId字段）
          if ('userId' in table) {
            whereConditions.push(eq(table.userId, this.userId));
          }

          if (whereConditions.length > 0) {
            const exists = await trx.query[tableName].findFirst({
              where: and(...whereConditions),
            });

            if (exists) {
              // 记录冲突
              if (!this.conflictRecords[tableName]) this.conflictRecords[tableName] = [];
              this.conflictRecords[tableName].push({
                field: uniqueConstraints.join(','),
                value: uniqueConstraints
                  .map((field) => `${field}=${record.newRecord[field]}`)
                  .join(','),
              });

              // 应用冲突策略
              switch (conflictStrategy) {
                case 'skip': {
                  record.newRecord._skip = true;
                  result.skips++;

                  // 关键改进：即使跳过，也建立ID映射关系
                  if (!isCompositeKey) {
                    this.idMaps[tableName][record.originalId] = exists.id;
                    if (record.newRecord.clientId) {
                      this.idMaps[tableName][record.newRecord.clientId] = exists.id;
                    }
                  }
                  break;
                }
                case 'override': {
                  // 不需要额外操作，插入时会覆盖
                  break;
                }
                case 'merge': {
                  // 合并数据
                  await trx
                    .update(table)
                    .set(record.newRecord)
                    .where(and(...whereConditions));
                  record.newRecord._skip = true;
                  if (result.updated) result.updated++;
                  else {
                    result.updated = 1;
                  }
                  break;
                }
              }
            }
          }
        } else {
          // 处理唯一约束
          for (const field of uniqueConstraints) {
            if (!record.newRecord[field]) continue;

            // 检查字段值是否已存在
            const exists = await trx.query[tableName].findFirst({
              where: eq(table[field], record.newRecord[field]),
            });

            if (exists) {
              // 记录冲突
              if (!this.conflictRecords[tableName]) this.conflictRecords[tableName] = [];
              this.conflictRecords[tableName].push({
                field,
                value: record.newRecord[field],
              });

              // 应用冲突策略
              switch (conflictStrategy) {
                case 'skip': {
                  record.newRecord._skip = true;
                  result.skips++;

                  // 关键改进：即使跳过，也建立ID映射关系
                  if (!isCompositeKey) {
                    this.idMaps[tableName][record.originalId] = exists.id;
                    if (record.newRecord.clientId) {
                      this.idMaps[tableName][record.newRecord.clientId] = exists.id;
                    }
                  }
                  break;
                }
                case 'override': {
                  // 应用字段处理器
                  if (field in fieldProcessors) {
                    record.newRecord[field] = fieldProcessors[field](record.newRecord[field]);
                  }
                  break;
                }

                case 'merge': {
                  // 合并数据
                  await trx
                    .update(table)
                    .set(record.newRecord)
                    .where(eq(table[field], record.newRecord[field]));
                  record.newRecord._skip = true;
                  if (result.updated) result.updated++;
                  else {
                    result.updated = 1;
                  }
                  break;
                }
              }
            }
          }
        }
      }

      // 过滤掉标记为跳过的记录
      const filteredData = preparedData.filter((record) => !record.newRecord._skip);

      // 清除临时标记
      filteredData.forEach((record) => delete record.newRecord._skip);

      // 6. 批量插入数据
      const BATCH_SIZE = 100;

      for (let i = 0; i < filteredData.length; i += BATCH_SIZE) {
        const batch = filteredData.slice(i, i + BATCH_SIZE).filter(Boolean);

        const itemsToInsert = batch.map((item) => item.newRecord);
        const originalIds = batch.map((item) => item.originalId);

        try {
          // 插入并返回结果
          const insertQuery = trx.insert(table).values(itemsToInsert);

          let insertResult;

          // 只对非复合主键表需要返回ID
          if (!isCompositeKey) {
            const res = await insertQuery.returning();
            insertResult = res.map((item: any) => ({
              clientId: 'clientId' in item ? item.clientId : undefined,
              id: item.id,
            }));
          } else {
            await insertQuery;
            insertResult = itemsToInsert.map(() => ({})); // 创建空结果以维持计数
          }

          result.added += insertResult.length;

          // 建立ID映射关系 (只对非复合主键表)
          if (!isCompositeKey) {
            for (const [j, newRecord] of insertResult.entries()) {
              const originalId = originalIds[j];
              this.idMaps[tableName][originalId] = newRecord.id;

              // 同时确保clientId也能映射到正确的ID
              const originalRecord = tableData.find((item) => item.id === originalId);
              if (originalRecord && originalRecord.clientId) {
                this.idMaps[tableName][originalRecord.clientId] = newRecord.id;
              }
            }
          }
        } catch (error) {
          console.error(`Error batch inserting ${tableName}:`, error);

          // 处理错误并记录
          if ((error as any).code === '23505') {
            const match = (error as any).detail?.match(/Key \((.+?)\)=\((.+?)\) already exists/);
            if (match) {
              const conflictField = match[1];

              if (!this.conflictRecords[tableName]) this.conflictRecords[tableName] = [];
              this.conflictRecords[tableName].push({
                field: conflictField,
                value: match[2],
              });
            }
          }

          result.errors += batch.length;
        }
      }

      return result;
    } catch (error) {
      console.error(`Error importing table ${tableName}:`, error);
      result.errors = tableData.length;
      return result;
    }
  }
}
