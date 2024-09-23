/* eslint-disable sort-keys-fix/sort-keys-fix  */
import { relations } from 'drizzle-orm';
import { pgTable, primaryKey, text } from 'drizzle-orm/pg-core';

import { agents, agentsFiles, agentsKnowledgeBases } from './agent';
import { asyncTasks } from './asyncTask';
import { agentsTags, plugins, pluginsTags, tags } from './discover';
import { files, knowledgeBases } from './file';
import { messages, messagesFiles } from './message';
import { unstructuredChunks } from './rag';
import { sessionGroups, sessions } from './session';
import { topics } from './topic';

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

export const pluginsRelations = relations(plugins, ({ many }) => ({
  pluginsTags: many(pluginsTags),
}));

export const pluginsTagsRelations = relations(pluginsTags, ({ one }) => ({
  plugin: one(plugins, {
    fields: [pluginsTags.pluginId],
    references: [plugins.id],
  }),
  tag: one(tags, {
    fields: [pluginsTags.tagId],
    references: [tags.id],
  }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  agentsTags: many(agentsTags),
  pluginsTags: many(pluginsTags),
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
}));

export const agentsRelations = relations(agents, ({ many }) => ({
  agentsToSessions: many(agentsToSessions),
  knowledgeBases: many(agentsKnowledgeBases),
  files: many(agentsFiles),
  agentsTags: many(agentsTags),
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

export const agentsTagsRelations = relations(agentsTags, ({ one }) => ({
  agent: one(agents, {
    fields: [agentsTags.agentId],
    references: [agents.id],
  }),
  tag: one(tags, {
    fields: [agentsTags.tagId],
    references: [tags.id],
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
