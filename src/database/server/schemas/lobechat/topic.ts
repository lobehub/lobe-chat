//  ======== topics ======= //
import { boolean, pgTable, text, unique } from 'drizzle-orm/pg-core';

import { idGenerator } from '../../utils/idGenerator';
import { createdAt, updatedAt } from './_helpers';
import { sessions } from './session';
import { users } from './user';

export const topics = pgTable(
  'topics',
  {
    clientId: text('client_id'),
    createdAt: createdAt(),
    favorite: boolean('favorite').default(false),
    id: text('id')
      .$defaultFn(() => idGenerator('topics'))
      .primaryKey(),
    sessionId: text('session_id').references(() => sessions.id, { onDelete: 'cascade' }),
    title: text('title'),

    updatedAt: updatedAt(),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (t) => ({
    clientIdUnique: unique('topic_client_id_user_id_unique').on(t.clientId, t.userId),
  }),
);

export type NewTopic = typeof topics.$inferInsert;
export type TopicItem = typeof topics.$inferSelect;
