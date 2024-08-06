/* eslint-disable sort-keys-fix/sort-keys-fix  */
import { relations } from 'drizzle-orm';

import {
  agents,
  agentsToSessions,
  filesToAgents,
  filesToMessages,
  filesToSessions,
  messages,
  sessionGroups,
  sessions,
  topics,
} from './chat';
import { agentsTags, plugins, pluginsTags, tags } from './discover';
import { files } from './file';

export const filesRelations = relations(files, ({ many }) => ({
  filesToMessages: many(filesToMessages),
  filesToSessions: many(filesToSessions),
  filesToAgents: many(filesToAgents),
}));

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
  filesToMessages: many(filesToMessages),

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
  filesToAgents: many(filesToAgents),
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

export const filesToAgentsRelations = relations(filesToAgents, ({ one }) => ({
  agent: one(agents, {
    fields: [filesToAgents.agentId],
    references: [agents.id],
  }),
  file: one(files, {
    fields: [filesToAgents.fileId],
    references: [files.id],
  }),
}));

export const filesToMessagesRelations = relations(filesToMessages, ({ one }) => ({
  file: one(files, {
    fields: [filesToMessages.fileId],
    references: [files.id],
  }),
  message: one(messages, {
    fields: [filesToMessages.messageId],
    references: [messages.id],
  }),
}));

export const filesToSessionsRelations = relations(filesToSessions, ({ one }) => ({
  file: one(files, {
    fields: [filesToSessions.fileId],
    references: [files.id],
  }),
  session: one(sessions, {
    fields: [filesToSessions.sessionId],
    references: [sessions.id],
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
