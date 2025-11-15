/* eslint-disable sort-keys-fix/sort-keys-fix  */
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

import { LobeDocumentPage } from '@/types/document';
import { FileSource } from '@/types/files';

import { idGenerator } from '../utils/idGenerator';
import { accessedAt, createdAt, timestamps } from './_helpers';
import { asyncTasks } from './asyncTask';
import { chunks } from './rag';
import { users } from './user';

export const globalFiles = pgTable('global_files', {
  hashId: varchar('hash_id', { length: 64 }).primaryKey(),
  fileType: varchar('file_type', { length: 255 }).notNull(),
  size: integer('size').notNull(),
  url: text('url').notNull(),
  metadata: jsonb('metadata'),
  creator: text('creator')
    .references(() => users.id, { onDelete: 'set null' })
    .notNull(),
  createdAt: createdAt(),
  accessedAt: accessedAt(),
});

export type NewGlobalFile = typeof globalFiles.$inferInsert;
export type GlobalFileItem = typeof globalFiles.$inferSelect;

/**
 * 文档表 - 存储文件内容或网页搜索结果
 */
// @ts-ignore
export const documents = pgTable(
  'documents',
  {
    id: varchar('id', { length: 30 })
      .$defaultFn(() => idGenerator('documents', 16))
      .primaryKey(),

    // 基本信息
    title: text('title'),
    content: text('content'),

    // Special type: custom/folder
    fileType: varchar('file_type', { length: 255 }).notNull(),
    filename: text('filename'),

    // 统计信息
    totalCharCount: integer('total_char_count').notNull(),
    totalLineCount: integer('total_line_count').notNull(),

    // 元数据
    metadata: jsonb('metadata').$type<Record<string, any>>(),

    // 页面/块数据
    pages: jsonb('pages').$type<LobeDocumentPage[]>(),

    // 来源类型
    sourceType: text('source_type', { enum: ['file', 'web', 'api'] }).notNull(),
    source: text('source').notNull(), // 文件路径或网页URL

    // 关联文件（可选）
    // Forward reference to files table defined below
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    // @ts-expect-error - files is defined later in this file, forward reference is valid at runtime
    fileId: text('file_id').references(() => files.id, { onDelete: 'set null' }),

    // 父文档（用于文件夹层级结构）
    // @ts-ignore
    parentId: varchar('parent_id', { length: 30 }).references(() => documents.id, {
      onDelete: 'set null',
    }),

    // 用户关联
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    clientId: text('client_id'),

    editorData: jsonb('editor_data').$type<Record<string, any>>(),

    // 时间戳
    ...timestamps,
  },
  (table) => [
    index('documents_source_idx').on(table.source),
    index('documents_file_type_idx').on(table.fileType),
    index('documents_file_id_idx').on(table.fileId),
    index('documents_parent_id_idx').on(table.parentId),
    uniqueIndex('documents_client_id_user_id_unique').on(table.clientId, table.userId),
  ],
);

export type NewDocument = typeof documents.$inferInsert;
export type DocumentItem = typeof documents.$inferSelect;
export const insertDocumentSchema = createInsertSchema(documents);

/**
 * 文档块表 - 将文档内容分割成块并关联到 chunks 表，用于向量检索
 * 注意：此表可选，如果已经使用 pages 字段存储了文档块，可以不需要此表
 */
export const documentChunks = pgTable(
  'document_chunks',
  {
    documentId: varchar('document_id', { length: 30 })
      .references(() => documents.id, { onDelete: 'cascade' })
      .notNull(),

    chunkId: uuid('chunk_id')
      .references(() => chunks.id, { onDelete: 'cascade' })
      .notNull(),

    pageIndex: integer('page_index'),

    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),

    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.documentId, t.chunkId] })],
);

export type NewDocumentChunk = typeof documentChunks.$inferInsert;
export type DocumentChunkItem = typeof documentChunks.$inferSelect;

// @ts-ignore
export const files = pgTable(
  'files',
  {
    id: text('id')
      .$defaultFn(() => idGenerator('files'))
      .primaryKey(),

    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    /**
     * mime
     */
    fileType: varchar('file_type', { length: 255 }).notNull(),
    /**
     * sha256
     */
    fileHash: varchar('file_hash', { length: 64 }).references(() => globalFiles.hashId, {
      onDelete: 'no action',
    }),
    name: text('name').notNull(),
    size: integer('size').notNull(),
    url: text('url').notNull(),
    source: text('source').$type<FileSource>(),

    // 父文档（用于文件夹层级结构）
    // @ts-ignore
    parentId: varchar('parent_id', { length: 30 }).references(() => documents.id, {
      onDelete: 'set null',
    }),

    clientId: text('client_id'),
    metadata: jsonb('metadata'),
    chunkTaskId: uuid('chunk_task_id').references(() => asyncTasks.id, { onDelete: 'set null' }),
    embeddingTaskId: uuid('embedding_task_id').references(() => asyncTasks.id, {
      onDelete: 'set null',
    }),

    ...timestamps,
  },
  (table) => {
    return {
      fileHashIdx: index('file_hash_idx').on(table.fileHash),
      parentIdIdx: index('files_parent_id_idx').on(table.parentId),
      clientIdUnique: uniqueIndex('files_client_id_user_id_unique').on(
        table.clientId,
        table.userId,
      ),
    };
  },
);
export type NewFile = typeof files.$inferInsert;
export type FileItem = typeof files.$inferSelect;

export const knowledgeBases = pgTable(
  'knowledge_bases',
  {
    id: text('id')
      .$defaultFn(() => idGenerator('knowledgeBases'))
      .primaryKey(),

    name: text('name').notNull(),
    description: text('description'),
    avatar: text('avatar'),

    // different types of knowledge bases need to be distinguished
    type: text('type'),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    clientId: text('client_id'),

    isPublic: boolean('is_public').default(false),

    settings: jsonb('settings'),

    ...timestamps,
  },
  (t) => ({
    clientIdUnique: uniqueIndex('knowledge_bases_client_id_user_id_unique').on(
      t.clientId,
      t.userId,
    ),
  }),
);

export const insertKnowledgeBasesSchema = createInsertSchema(knowledgeBases);

export type NewKnowledgeBase = typeof knowledgeBases.$inferInsert;
export type KnowledgeBaseItem = typeof knowledgeBases.$inferSelect;

export const knowledgeBaseFiles = pgTable(
  'knowledge_base_files',
  {
    knowledgeBaseId: text('knowledge_base_id')
      .references(() => knowledgeBases.id, { onDelete: 'cascade' })
      .notNull(),

    fileId: text('file_id')
      .references(() => files.id, { onDelete: 'cascade' })
      .notNull(),

    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),

    createdAt: createdAt(),
  },
  (t) => ({
    pk: primaryKey({
      columns: [t.knowledgeBaseId, t.fileId],
    }),
  }),
);
