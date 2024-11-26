/* eslint-disable sort-keys-fix/sort-keys-fix  */
import { relations } from 'drizzle-orm';
import { pgTable, primaryKey, text } from 'drizzle-orm/pg-core';

import { agents, agentsFiles, agentsKnowledgeBases } from './agent';
import { asyncTasks } from './asyncTask';
import { files, knowledgeBases } from './file';
import { messages, messagesFiles } from './message';
import { unstructuredChunks } from './rag';
import { sessionGroups, sessions } from './session';
import { threads, topics } from './topic';

export const agentsToSessions = pgTable(
  'agents_to_sessions',
  {
    agentId: text('agent_id')
      .notNull()
      .references(() => agents.id, { onDelete: 'cascade' }),
    sessionId: text('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.agentId, t.sessionId] }),
  }),
);

export const filesToSessions = pgTable(
  'files_to_sessions',
  {
    fileId: text('file_id')
      .notNull()
      .references(() => files.id, { onDelete: 'cascade' }),
    sessionId: text('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.fileId, t.sessionId] }),
  }),
);

export const topicRelations = relations(topics, ({ one }) => ({
  session: one(sessions, {
    fields: [topics.sessionId],
    references: [sessions.id],
  }),
}));

export const threadsRelations = relations(threads, ({ one }) => ({
  sourceMessage: one(messages, {
    fields: [threads.sourceMessageId],
    references: [messages.id],
  }),
}));

export const messagesRelations = relations(messages, ({ many, one }) => ({
  filesToMessages: many(messagesFiles),

  session: one(sessions, {
    fields: [messages.sessionId],
    references: [sessions.id],
  }),

  parent: one(messages, {
    fields: [messages.parentId],
    references: [messages.id],
  }),

  topic: one(topics, {
    fields: [messages.topicId],
    references: [topics.id],
  }),

  thread: one(threads, {
    fields: [messages.threadId],
    references: [threads.id],
  }),
}));

export const agentsRelations = relations(agents, ({ many }) => ({
  agentsToSessions: many(agentsToSessions),
  knowledgeBases: many(agentsKnowledgeBases),
  files: many(agentsFiles),
}));

export const agentsToSessionsRelations = relations(agentsToSessions, ({ one }) => ({
  session: one(sessions, {
    fields: [agentsToSessions.sessionId],
    references: [sessions.id],
  }),
  agent: one(agents, {
    fields: [agentsToSessions.agentId],
    references: [agents.id],
  }),
}));

export const agentsKnowledgeBasesRelations = relations(agentsKnowledgeBases, ({ one }) => ({
  knowledgeBase: one(knowledgeBases, {
    fields: [agentsKnowledgeBases.knowledgeBaseId],
    references: [knowledgeBases.id],
  }),
  agent: one(agents, {
    fields: [agentsKnowledgeBases.agentId],
    references: [agents.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ many, one }) => ({
  filesToSessions: many(filesToSessions),
  agentsToSessions: many(agentsToSessions),
  group: one(sessionGroups, {
    fields: [sessions.groupId],
    references: [sessionGroups.id],
  }),
}));

export const chunksRelations = relations(unstructuredChunks, ({ one }) => ({
  file: one(files, {
    fields: [unstructuredChunks.fileId],
    references: [files.id],
  }),
}));

export const filesRelations = relations(files, ({ many, one }) => ({
  messages: many(messagesFiles),
  sessions: many(filesToSessions),
  agents: many(agentsFiles),

  chunkingTask: one(asyncTasks, {
    fields: [files.chunkTaskId],
    references: [asyncTasks.id],
  }),
  embeddingTask: one(asyncTasks, {
    fields: [files.embeddingTaskId],
    references: [asyncTasks.id],
  }),
}));
