/* eslint-disable sort-keys-fix/sort-keys-fix  */
import { integer, jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core';

import { createdAt, updatedAt } from './_helpers';
import { asyncTasks } from './asyncTask';
import { knowledgeBases } from './file';
import { users } from './user';

export const evalDatasets = pgTable('rag_eval_datasets', {
  id: integer('id').generatedAlwaysAsIdentity({ startWith: 30_000 }).primaryKey(),

  description: text('description'),
  name: text('name').notNull(),

  knowledgeBaseId: text('knowledge_base_id').references(() => knowledgeBases.id, {
    onDelete: 'cascade',
  }),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),

  updatedAt: updatedAt(),
  createdAt: createdAt(),
});

export type NewEvalDatasetsItem = typeof evalDatasets.$inferInsert;
export type EvalDatasetsSelectItem = typeof evalDatasets.$inferSelect;

export const evalDatasetRecords = pgTable('rag_eval_dataset_records', {
  id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
  datasetId: integer('dataset_id')
    .references(() => evalDatasets.id, { onDelete: 'cascade' })
    .notNull(),

  ideal: text('ideal'),
  question: text('question'),
  referenceFiles: text('reference_files').array(),
  metadata: jsonb('metadata'),

  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: createdAt(),
});

export type NewEvalDatasetRecordsItem = typeof evalDatasetRecords.$inferInsert;
export type EvalDatasetRecordsSelectItem = typeof evalDatasetRecords.$inferSelect;

export const evalReports = pgTable('rag_eval_reports', {
  id: integer('id').generatedAlwaysAsIdentity({ startWith: 10_000 }).primaryKey(),
  name: text('name'),
  exportUrl: text('export_url'),

  result: jsonb('result'),

  taskId: uuid('task_id')
    .references(() => asyncTasks.id)
    .notNull(),

  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: createdAt(),
});

export type NewEvalReportsItem = typeof evalReports.$inferInsert;
export type EvalReportsSelectItem = typeof evalReports.$inferSelect;

export const evalResults = pgTable('rag_eval_results', {
  id: integer('id').generatedAlwaysAsIdentity().primaryKey(),

  question: text('question').notNull(),
  answer: text('answer').notNull(),
  context: text('context').array(),
  groundTruth: text('ground_truth'),

  taskId: uuid('task_id')
    .references(() => asyncTasks.id)
    .notNull(),
  datasetItemId: integer('dataset_item_id')
    .references(() => evalDatasetRecords.id)
    .notNull(),
  reportId: integer('report_id')
    .references(() => evalReports.id)
    .notNull(),

  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: createdAt(),
});

export type NewEvalResultsItem = typeof evalResults.$inferInsert;
export type EvalResultsSelectItem = typeof evalResults.$inferSelect;
