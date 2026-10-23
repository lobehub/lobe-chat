# Channel persistence boundary

Channel is a collaboration and coordination domain, not another chat/runtime store.
This package provides the data contract only; it does not activate Channel routers or execution adapters.

## Canonical data

| Responsibility                                                                  | Storage                                                                         |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Membership, roles, routing, branches, ordering                                  | Channel tables                                                                  |
| Public branch timeline                                                          | `topics` (`mode=channel`, `channelId`, `userId=NULL`)                           |
| Public body, files                                                              | `messages`, `messages_files`; `channel_messages.id` is the canonical message ID |
| Private execution context                                                       | `topics` (`mode=channel_runtime`), ordinary messages/checkpoints                |
| CLI resume handle                                                               | Private topic's `metadata.heteroSessionId`, never a database topic ID           |
| Execution identity, outcome, usage, traces                                      | One `agent_operations` row per claimed run                                      |
| Delivery receipt, cursor, publication fence, directory ownership, physical stop | Channel session/run extensions                                                  |

Public history belongs to the Channel, not its creator. Author membership keeps attribution after
an account is removed. Existing non-Channel topic/message rows still require a user owner. Private
context belongs to the actual requesting user, not the Channel creator or agent owner. The session
mapping binds agent member + branch + generation to a topic, principal and environment version.
A principal/environment change, missing topic, or quarantine starts a fresh generation. Only an
accepted input advances the cursor; rejected or unknown submissions never silently consume it.

## Access and integration contract

- `ChannelModel` checks Channel membership/role and workspace scope for public reads and writes.
  The eventual router must also authenticate active workspace membership.
- Ordinary topic/message/operation constructors, search projection, sharing and memory extraction
  exclude Channel data, even for workspace owners. Workspace membership alone does not expose it.
  Parent scope also protects older writers that omit the child's `channelId`.
- Trusted execution adapters use the topic/message/operation model's explicit `channelId` option
  **after authorization**. This is an internal scope selector, not a membership authorization API.
  It also binds runtime reads/writes to the requesting user; it cannot read the public timeline.
- Pass the claim's `topic.id` and `run.operationId` into the existing runtime. Call `recordStart`
  on the reserved idle operation before acknowledging dispatch. A repeated start cannot reset a
  terminal operation. Native checkpoints and heterogeneous ingestion must use this same scope.
- Persist private transcript and usage through canonical models. Channel publication copies only
  the selected final reply and permitted attachments into the public timeline, never tool output
  or intermediate private history. File authorization must precede association with a message.
- Operation completion is not physical process termination. Do not free a writer/directory lock
  until stop/release is confirmed or explicitly quarantined. Never retry an unknown delivery.
- Generic operation status/stream/intervention endpoints intentionally reject Channel operations.
  A future Channel endpoint must independently authorize any public projection of execution state.

## Deployment boundary

`0184_channel_tables` is the final schema for the **unreleased upstream PR**, after merging canary's
0183 migration. It is not a conversion script for a previously deployed CPC schema. Idempotent DDL
permits replay of this exact schema, not reconciliation of differently shaped tables with the same
names. Before enabling a separately deployed CPC installation, inventory its schema and migration
journal, drain or fence in-flight executions, and test a data conversion plus cutover against a copy
of that installation. Do not infer migration safety from a clean-database test.

Focused coverage lives in `__tests__`, `../__tests__/channelIsolation.test.ts`, schema tests and
file-reference tests. Run the Channel suite with PostgreSQL (`vitest.config.server.mts`) as well as
PGlite: the two concurrent-claim/sequence tests require real PostgreSQL row locking.
