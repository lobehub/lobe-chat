import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { PgDialect } from 'drizzle-orm/pg-core';
import { describe, expect, it } from 'vitest';

import { agentMails } from '../schemas/agentMail';
import { llmGenerationTracing } from '../schemas/llmGenerationTracing';
import {
  messagePlugins,
  messages,
  messagesFiles,
  messageTranslates,
  messageTTS,
} from '../schemas/message';
import { threads, topics } from '../schemas/topic';
import { channelScopeWhere } from './channelScope';

const render = (userIdColumn: AnyPgColumn) => {
  const condition = channelScopeWhere(userIdColumn);
  return condition ? new PgDialect().sqlToQuery(condition).sql : '';
};

describe('channelScopeWhere', () => {
  it('scopes rows through their parent topic when topicId is a foreign key', () => {
    expect(render(messages.userId)).toContain('"channel_scope_topic"');
    expect(render(threads.userId)).toContain('"channel_scope_topic"');
  });

  it('scopes rows through their parent message by messageId or a one-to-one child id', () => {
    for (const table of [messagesFiles, messagePlugins, messageTranslates, messageTTS]) {
      expect(render(table.userId)).toContain('"channel_scope_message"');
    }
  });

  it('only filters the own channel column of a topic', () => {
    const sql = render(topics.userId);
    expect(sql).toBe('"topics"."channel_id" is null');
  });

  it('ignores columns that only record an id without a foreign key', () => {
    // A trace outlives its topic; an email Message-ID is not a messages row.
    expect(render(llmGenerationTracing.userId)).toBe('');
    expect(render(agentMails.userId)).toBe('');
  });
});
