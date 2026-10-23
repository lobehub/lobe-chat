# Channel persistence boundary

Channel is a collaboration and coordination domain, not another chat/runtime store.
This package provides the data contract only; it does not activate Channel routers or execution adapters.
It lives in the repositories layer because every write locks the `channels` row and then writes
Channel rows together with canonical `messages`, `topics` or `agent_operations` in one transaction.

## Canonical data

| Responsibility                                                | Storage                                                                         |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Membership, roles, routing, branches, ordering                | Channel tables                                                                  |
| Public branch timeline                                        | `topics` (`mode=channel`, `channelId`, `userId=NULL`)                           |
| Public body, files                                            | `messages`, `messages_files`; `channel_messages.id` is the canonical message ID |
| Private execution context                                     | One new `topics` row per run (`mode=channel_runtime`), ordinary messages        |
| CLI resume handle                                             | The run topic's `metadata.heteroSessionId`, never a database topic ID           |
| Execution identity, status, errors, usage, traces             | One `agent_operations` row per claimed job; its `topicId` is the run topic      |
| FIFO, frozen input, lease, writer/directory lock, publication | `channel_jobs` (the job is the run: at most one execution per delivery)         |

Public history belongs to the Channel, not its creator. Author membership keeps attribution after
an account is removed. Existing non-Channel topic/message rows still require a user owner. Private
context belongs to the actual requesting user, not the Channel creator or agent owner. Every claim
creates a fresh private topic and hands the runtime a full snapshot of the branch up to the
request, so there is no session to resume across runs and no cursor to keep in sync. The job
freezes where that snapshot ends (`manifest.cutoffSequence`), not a copy of its messages, so a job
does not grow with its branch. A retry is a new job (new `delivery_key`), never a second execution
of the same job.

Channels use `user_id` alongside `workspace_id`; authorization still uses membership.
The optional `project_id` references `projects.id` and is cleared on project deletion,
preserving the channel and its history. Project association does not grant Channel access.
Member IDs and all relational member references are UUIDs. Agent membership references
`agents.id` through nullable `agent_id`, not `config.agentId`; deleting an Agent clears the
reference without deleting its member or public history. Human members cannot carry `agent_id`.
Runtime/display configuration remains a snapshot; Agent access must be authorized by adapters.

## Access and integration contract

- Channel transactions serialize writes with row locks, not a global revision counter.
  Realtime invalidation and missed-event recovery belong to the future subscription layer;
  canonical runtime updates and foreign-key cleanup do not all pass through Channel writes.
  Message sequence and environment revisions remain independent correctness constraints, not
  versions of a whole-channel snapshot.
- `ChannelRepository` checks Channel membership/role and workspace scope for public reads and writes.
  The eventual router must also authenticate active workspace membership.
- Ordinary topic/message/operation constructors, search projection, sharing and memory extraction
  exclude Channel data, even for workspace owners. Workspace membership alone does not expose it.
  Parent scope also protects older writers that omit the child's `channelId`. It follows declared
  foreign keys (`topicId` → `topics.id`; `messageId`, or a one-to-one child's `id`, →
  `messages.id`), so a table that only records an id, such as `llm_generation_tracing.topic_id`,
  is not parent-scoped: a Channel integration that writes such rows must scope them itself.
  Code that filters `messages` / `topics` by owner directly instead of through
  `buildWorkspaceWhere` must AND in `notChannelData` (nightly digest, expertise backfill).
- Trusted execution adapters use the topic/message/operation model's explicit `channelId` option
  **after authorization**. This is an internal scope selector, not a membership authorization API.
  It also binds runtime reads/writes to the requesting user; it cannot read the public timeline.
- Read the run's input with `ChannelExecutionRepository.input(channelId, jobId)`. It needs no
  channel lock: Channel writes change only the routing fields of a sent message, so nothing at or
  before the cutoff changes. Keep it that way; editing a sent message would change the input of
  runs that already claimed it.
- Pass the claim's `topic.id` and `job.operationId` into the existing runtime. Call `recordStart`
  on the reserved idle operation before acknowledging dispatch. A repeated start cannot reset a
  terminal operation. Native checkpoints and heterogeneous ingestion must use this same scope.
- Execution status and errors are written only to the operation. The job's `status` is the
  Channel outcome (queued, running, completed, failed, cancelled); release settles it from the
  operation, e.g. an abandoned operation (unknown execution or isolation) fails the job.
- Persist private transcript and usage through canonical models. Channel publication copies only
  the selected final reply and permitted attachments into the public timeline, never tool output
  or intermediate private history. File authorization must precede association with a message.
- Operation completion is not physical process termination. `writer_held` backs the per-member
  and per-directory unique locks; only `releaseWriter` (physical stop confirmed) or a trusted
  `notSubmitted` failure (nothing ran) clears it. Isolation frees the member but keeps the
  directory locked until release. Never retry an unknown delivery.
- Operations outlive their channel: `agent_operations.channel_id` is not a foreign key, so usage
  history survives channel deletion and the stale id keeps it out of ordinary reads.
- Generic operation status/stream/intervention endpoints intentionally reject Channel operations.
  A future Channel endpoint must independently authorize any public projection of execution state.

## Deployment boundary

`0184_channel_tables` is the final schema for the **unreleased upstream PR**, after merging canary's
0183 migration. It is not a conversion script for a previously deployed CPC schema. Idempotent DDL
permits replay of this exact schema, not reconciliation of differently shaped tables with the same
names. Before enabling a separately deployed CPC installation, inventory its schema and migration
journal, drain or fence in-flight executions, and test a data conversion plus cutover against a copy
of that installation. Do not infer migration safety from a clean-database test.

0184 adds the `messages` / `topics` constraints `NOT VALID`, so it does not scan those tables while
holding their locks. Its four indexes on `messages`, `topics` and `agent_operations` still scan them;
the SQL comments in `0184_channel_tables.sql` list the online pre-deploy steps for large databases.

Focused coverage lives in `__tests__`, `../../models/__tests__/channelIsolation.test.ts`, schema tests and
file-reference tests. Run the Channel suite with PostgreSQL (`vitest.config.server.mts`) as well as
PGlite: the two concurrent-claim/sequence tests require real PostgreSQL row locking.
