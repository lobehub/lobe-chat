import type {
  AcceptanceFlowReview,
  AcceptanceFlowRunStatus,
  AcceptanceFlowVerdict,
} from '@lobechat/types';
import {
  boolean,
  foreignKey,
  integer,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { timestamps } from './_helpers';
import { acceptances, verifyCheckResults, verifyRuns } from './verify';

export const acceptanceFlows = pgTable('acceptance_flows', {
  id: uuid('id').defaultRandom().primaryKey(),
  acceptanceId: uuid('acceptance_id')
    .notNull()
    .references(() => acceptances.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  ...timestamps,
});
/** Versions are published atomically and immutable, including their graph children. */
export const acceptanceFlowVersions = pgTable(
  'acceptance_flow_versions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    flowId: uuid('flow_id')
      .notNull()
      .references(() => acceptanceFlows.id, { onDelete: 'cascade' }),
    version: integer('version').notNull(),
    title: text('title').notNull(),
    goal: text('goal').notNull(),
    preconditions: text('preconditions').notNull(),
    entryNodeKey: text('entry_node_key').notNull(),
    ...timestamps,
  },
  (t) => [uniqueIndex('acceptance_flow_version_unique').on(t.flowId, t.version)],
);
export const acceptanceFlowNodes = pgTable(
  'acceptance_flow_nodes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    flowVersionId: uuid('flow_version_id')
      .notNull()
      .references(() => acceptanceFlowVersions.id, { onDelete: 'cascade' }),
    nodeKey: text('node_key').notNull(),
    title: text('title').notNull(),
    instruction: text('instruction').notNull(),
    expected: text('expected').notNull(),
  },
  (t) => [uniqueIndex('acceptance_flow_node_key_unique').on(t.flowVersionId, t.nodeKey)],
);
export const acceptanceFlowEdges = pgTable(
  'acceptance_flow_edges',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    flowVersionId: uuid('flow_version_id')
      .notNull()
      .references(() => acceptanceFlowVersions.id, { onDelete: 'cascade' }),
    edgeKey: text('edge_key').notNull(),
    sourceNodeKey: text('source_node_key').notNull(),
    targetNodeKey: text('target_node_key').notNull(),
    trigger: text('trigger').notNull(),
    condition: text('condition'),
    required: boolean('required').notNull().default(true),
  },
  (t) => [
    uniqueIndex('acceptance_flow_edge_key_unique').on(t.flowVersionId, t.edgeKey),
    foreignKey({
      columns: [t.flowVersionId, t.sourceNodeKey],
      foreignColumns: [acceptanceFlowNodes.flowVersionId, acceptanceFlowNodes.nodeKey],
    }).onDelete('cascade'),
    foreignKey({
      columns: [t.flowVersionId, t.targetNodeKey],
      foreignColumns: [acceptanceFlowNodes.flowVersionId, acceptanceFlowNodes.nodeKey],
    }).onDelete('cascade'),
  ],
);
export const acceptanceFlowRuns = pgTable(
  'acceptance_flow_runs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    flowVersionId: uuid('flow_version_id')
      .notNull()
      .references(() => acceptanceFlowVersions.id, { onDelete: 'cascade' }),
    verifyRunId: uuid('verify_run_id')
      .notNull()
      .references(() => verifyRuns.id, { onDelete: 'cascade' }),
    status: text('status').$type<AcceptanceFlowRunStatus>().notNull().default('running'),
    ...timestamps,
  },
  (t) => [uniqueIndex('acceptance_flow_run_round_unique').on(t.flowVersionId, t.verifyRunId)],
);
/** Append-only visits: a retry never replaces earlier observed behavior. */
export const acceptanceFlowStepAttempts = pgTable(
  'acceptance_flow_step_attempts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    flowRunId: uuid('flow_run_id')
      .notNull()
      .references(() => acceptanceFlowRuns.id, { onDelete: 'cascade' }),
    nodeId: uuid('node_id')
      .notNull()
      .references(() => acceptanceFlowNodes.id, { onDelete: 'cascade' }),
    incomingEdgeId: uuid('incoming_edge_id').references(() => acceptanceFlowEdges.id, {
      onDelete: 'cascade',
    }),
    /** Previous visit in this path; null starts a fresh path from the entry state. */
    previousAttemptId: uuid('previous_attempt_id'),
    requestId: text('request_id').notNull(),
    sequence: integer('sequence').notNull(),
    observation: text('observation').notNull(),
    verdict: text('verdict').$type<AcceptanceFlowVerdict>().notNull(),
    checkResultId: uuid('check_result_id')
      .notNull()
      .references(() => verifyCheckResults.id, { onDelete: 'cascade' }),
    review: text('review').$type<AcceptanceFlowReview>(),
    reviewComment: text('review_comment'),
    reviewedBy: text('reviewed_by'),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('acceptance_flow_attempt_request_unique').on(t.flowRunId, t.requestId),
    uniqueIndex('acceptance_flow_attempt_sequence_unique').on(t.flowRunId, t.sequence),
  ],
);
