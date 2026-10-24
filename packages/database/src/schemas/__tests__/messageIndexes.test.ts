// @vitest-environment node
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { sql } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { getTestDB } from '../../core/getTestDB';

const serverDB = await getTestDB();

const migrationsFolder = path.join(__dirname, '../../../migrations');

describe('migration 0184', () => {
  it('converges when re-run on a database that already has it', async () => {
    const statements = readFileSync(
      path.join(migrationsFolder, '0184_message_pagination_and_plugin_indexes.sql'),
      'utf8',
    )
      .split('--> statement-breakpoint')
      .map((statement) => statement.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await serverDB.execute(sql.raw(statement));
    }
  });

  it('indexes top-level topic pagination and plugin lookups', async () => {
    const indexes = await serverDB.execute<{ indexdef: string; indexname: string }>(sql`
      SELECT indexname, indexdef FROM pg_indexes
      WHERE indexname IN (
        'message_plugins_api_name_idx',
        'message_plugins_identifier_idx',
        'messages_topic_id_created_at_id_idx'
      )
      ORDER BY indexname
    `);

    expect(indexes.rows.map((row) => row.indexname)).toEqual([
      'message_plugins_api_name_idx',
      'message_plugins_identifier_idx',
      'messages_topic_id_created_at_id_idx',
    ]);
    // Multi-model parallel replies are loaded by group, so only top-level rows are indexed.
    expect(indexes.rows[2].indexdef).toMatch(
      /\(topic_id, created_at, id\) WHERE \(message_group_id IS NULL\)/,
    );
  });
});
