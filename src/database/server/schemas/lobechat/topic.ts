/* eslint-disable sort-keys-fix/sort-keys-fix  */
import { boolean, jsonb, pgTable, text, unique } from 'drizzle-orm/pg-core';

import { idGenerator } from '../../utils/idGenerator';
import { timestamps } from './_helpers';
import { sessions } from './session';
import { users } from './user';

export const topics = pgTable(
  'topics',
  {
    id: text('id')
      .$defaultFn(() => idGenerator('topics'))
      .primaryKey(),
    title: text('title'),
    favorite: boolean('favorite').default(false),
    sessionId: text('session_id').references(() => sessions.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    clientId: text('client_id'),
    historySummary: text('history_summary'),
    metadata: jsonb('metadata'),
    ...timestamps,
  },
  (t) => ({
    clientIdUnique: unique('topic_client_id_user_id_unique').on(t.clientId, t.userId),
  }),
);

export type NewTopic = typeof topics.$inferInsert;
export type TopicItem = typeof topics.$inferSelect;
