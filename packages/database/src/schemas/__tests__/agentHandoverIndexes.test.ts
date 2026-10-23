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
      path.join(migrationsFolder, '0184_agent_handover_and_message_indexes.sql'),
      'utf8',
    )
      .split('--> statement-breakpoint')
      .map((statement) => statement.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await serverDB.execute(sql.raw(statement));
    }
  });

  it('indexes every agent reference a coordinator handover rewrites or a delete checks', async () => {
    const indexes = await serverDB.execute<{ indexdef: string; indexname: string }>(sql`
      SELECT indexname, indexdef FROM pg_indexes
      WHERE indexname IN (
        'agent_documents_deleted_by_agent_id_idx',
        'goal_node_decisions_resolved_by_agent_id_idx',
        'goal_nodes_created_by_agent_id_idx',
        'messages_target_id_idx',
        'signals_agent_id_idx',
        'task_activities_actor_agent_id_idx'
      )
      ORDER BY indexname
    `);

    expect(indexes.rows.map((row) => row.indexname)).toEqual([
      'agent_documents_deleted_by_agent_id_idx',
      'goal_node_decisions_resolved_by_agent_id_idx',
      'goal_nodes_created_by_agent_id_idx',
      'messages_target_id_idx',
      'signals_agent_id_idx',
      'task_activities_actor_agent_id_idx',
    ]);
    // Most messages have no target, so only the targeted ones are indexed.
    expect(
      indexes.rows.find((row) => row.indexname === 'messages_target_id_idx')?.indexdef,
    ).toMatch(/WHERE \(target_id IS NOT NULL\)/);
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
    expect(indexes.rows[2].indexdef).toMatch(
      /\(topic_id, created_at, id\) WHERE \(message_group_id IS NULL\)/,
    );
  });
});
