/* eslint-disable sort-keys-fix/sort-keys-fix  */
import { integer, jsonb, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

import { idGenerator } from '@/database/utils/idGenerator';

import { timestamps } from './_helpers';
import { asyncTasks } from './asyncTask';
import { users } from './user';

/**
 * 生成主题表 - 用于组织和管理 AI 生成内容的主题
 */
export const generationTopics = pgTable('generation_topics', {
  id: text('id')
    .$defaultFn(() => idGenerator('topics'))
    .notNull()
    .primaryKey(),

  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),

  /** 简要描述主题内容，由 LLM 生成 */
  title: text('title'),

  /** 主题封面图片 URL */
  imageUrl: text('image_url'),

  ...timestamps,
});

export const insertGenerationTopicSchema = createInsertSchema(generationTopics);

export type NewGenerationTopic = typeof generationTopics.$inferInsert;
export type GenerationTopicItem = typeof generationTopics.$inferSelect;

/**
 * 生成批次表 - 存储一次生成请求的配置信息
 */
export const generationBatches = pgTable('generation_batches', {
  /** 批次 ID */
  id: text('id')
    .$defaultFn(() => idGenerator('sessions'))
    .notNull()
    .primaryKey(),

  /** 用户 ID */
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),

  /** 关联的生成主题 ID */
  generationTopicId: text('generation_topic_id')
    .notNull()
    .references(() => generationTopics.id, { onDelete: 'cascade' }),

  /** 服务商名称 */
  provider: text('provider').notNull(),

  /** 模型名称 */
  model: text('model').notNull(),

  /** 生成提示词 */
  prompt: text('prompt').notNull(),

  /** 图片宽度 */
  width: integer('width'),

  /** 图片高度 */
  height: integer('height'),

  /** 图片比例 */
  ratio: varchar('ratio', { length: 64 }),

  /** 存储生成批次的配置，存放不需要建立索引的公共配置 */
  config: jsonb('config'),

  ...timestamps,
});

export const insertGenerationBatchSchema = createInsertSchema(generationBatches);

export type NewGenerationBatch = typeof generationBatches.$inferInsert;
export type GenerationBatchItem = typeof generationBatches.$inferSelect;

/**
 *  存储单个 AI 生成信息
 */
export const generations = pgTable('generations', {
  id: text('id')
    .$defaultFn(() => idGenerator('messages'))
    .notNull()
    .primaryKey(),

  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),

  /** 关联的生成批次 ID */
  generationBatchId: varchar('generation_batch_id', { length: 64 })
    .notNull()
    .references(() => generationBatches.id, { onDelete: 'cascade' }),

  /** 关联的异步任务 ID */
  asyncTaskId: uuid('async_task_id').references(() => asyncTasks.id, {
    onDelete: 'set null',
  }),

  /** 是否收藏 */
  //   favorite: boolean('favorite').default(false).notNull(),

  /** 是否发布到画廊 */
  //   published: boolean('published').default(false).notNull(),

  /** 生成种子值 */
  seed: text('seed'),

  /** 生成的资源信息，包含 URL、尺寸等 */
  asset: jsonb('asset'),

  ...timestamps,
});

export const insertGenerationSchema = createInsertSchema(generations);

export type NewGeneration = typeof generations.$inferInsert;
export type GenerationItem = typeof generations.$inferSelect;
