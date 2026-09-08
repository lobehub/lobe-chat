# Mapping migration workflow

Use this reference when changing Elasticsearch field definitions or operating index generations.
For initial provider cutover and complete environment setup, use
`docs/self-hosting/advanced/elasticsearch-migration.mdx` from the OSS repository root.

## Choose the operation

- Bump the entity's `schemaVersion` with its mapping change; keep any affected document schema and
  projection consistent. Update the expected fingerprint in `mappings.test.ts`; its guard rejects
  mapping changes without a bump and bumps without mapping changes. Shared analysis changes require
  version bumps and rebuilds for every entity, even if only one uses the analyzer being changed.
- Merely deploying this migration capability does not start a backfill or increase declared
  versions. A later entity version bump makes that entity eligible for upgrade.
- Rebuild into a new generation for field type/analyzer changes, removals, or when rollback matters.
  Only entities whose declared version changes need a new generation.
- Use `--in-place` only when status reports `upgrade_available` and `mappingChange: additive`.
  Currently this means new top-level fields; adding a multi-field to an existing field is classified
  as breaking. In-place still scans historical documents to populate the new fields. It preserves
  the physical name and offers no old-generation alias rollback.

## Operator prerequisites and recovery

Follow the public guide's
[Change a mapping later](../../../../docs/self-hosting/advanced/elasticsearch-migration.mdx#change-a-mapping-later)
section for the build, promote, optional rollback, retire, and in-place commands. Use the entity whose
mapping changed; the guide's `messages` and rollback version `1` are examples.

- Configure the intended `DATABASE_URL`, `ES_INDEX_NAMESPACE`, `ES_URL`, and endpoint authentication
  (`ES_API_KEY` for authenticated endpoints; the explicit insecure-HTTP opt-in for an appropriate
  local target). Preserve a durable `ES_REINDEX_STATE_DIR` through every step. In containers, mount
  persistent storage; stop the previous worker before copying the whole directory to another worker.
- Without `ES_URL`, `--status` reports `generations: null`: that is missing ES inspection, not proof
  that no upgrade is needed. Inspect `drift`, `unmanaged`, or `rollback_required` rather than forcing
  an upgrade through them. Live metadata still needs a valid run ID and schema version for sync
  readiness; only the legacy fingerprint may be absent.
- Build beside the old live alias with incremental sync running, then promote after backfill
  completion and an idle Outbox (`pending`, `retrying`, `inFlight`, `dead` all zero). A completed
  backfill does not move an existing alias. Verify actual searches and catch-up before retirement.
- Rollback is an optional recovery branch: select a retained, open older generation first, then
  redeploy matching older code. Older sync code rejects a live generation newer than it declares.
  Unlike forward promotion, rollback may accept an older stamped generation without its checkpoint.
- Retire only while the declared generation is serving and rollback is no longer needed. The first
  invocation closes old open indexes; a later one deletes already-closed indexes. Before deletion,
  let pre-close sync work finish and confirm a new drain resolves targets without the closed index.
  Back-to-back calls can let an old drain auto-create a deleted index again; the CLI enforces no gap.
- In-place widens the live mapping before backfill and pins the physical index in its checkpoint.
  Resume uses ordinary `--apply` with the same directory; no promote/retire step is needed for this
  operation. Metadata can already say `in_sync` while backfill is incomplete, so also inspect run and
  entity progress. It does not preserve a pre-upgrade index for alias rollback; recovery may require
  rebuilding from older code.

## Repeat, resume, and concurrency

The completed-run behavior below assumes the generation still covers the same entities. Adding an
entity to an existing generation reopens its checkpoint for that entity's backfill.

| Situation                                       | Actual behavior and operator action                                                                                                                 |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Same namespace/version, completed checkpoint    | Backfill returns without scanning or bulk-writing again. Preparation/status work can still run.                                                     |
| Same checkpoint, incomplete run                 | Reuses run ID, skips completed entities, and continues after saved cursors. An uncheckpointed batch may be replayed.                                |
| Missing checkpoint, existing indexes            | A new run can be rejected by `_meta.reindex_run_id`; restore the matching checkpoint. This is not a safe way to restart or adopt an existing index. |
| New empty target                                | Only this initial installation uses `--apply --fresh-run --yes`. Do not use it to resume or override a conflict.                                    |
| Two workers, same checkpoint directory          | Both can bulk-write the same batch. Cursor compare-and-swap prevents duplicate progress, but the file lock does not serialize the whole run.        |
| Two workers, different directories, same target | They do not share a lock; their run identities can conflict. Keep a single owner rather than using separate checkpoints as isolation.               |

These no-backfill guarantees concern `--apply`. Repeating `--promote` after the alias already serves
the target returns an error. Repeating `--retire` can advance from closing to deletion; never treat
all migration commands as interchangeable no-ops on retry.

## Large datasets and deployment automation

Both rebuild and in-place backfill scale with the documents scanned, projected, transferred, and
indexed. Measure a representative payload and real resource limits; a fast small synthetic dataset
does not establish production duration. Use bounded `--batch-size`, `--bulk-max-bytes`, and concurrency
options from the public migration guide. `--max-batches-per-entity` bounds a rehearsal or pause; exit
code zero alone does not mean the backfill is complete.

Do not append the full backfill to every application build as if it were Drizzle schema migration.
The current CLI requires persistent local checkpoints and a single worker, and a large backfill may
outlive the build's time budget. If automating, let the intended deployment trigger an independent
durable job with task-level exclusion, restartable state, and visible terminal status. Keep preview
targets isolated. Retain completion/fingerprint/Outbox gates before promotion; triggering a job does
not mean the migration or traffic switch is complete.

## Local Docker rehearsal

Run the relevant existing reindex, mapping, and sync tests for behavioral changes. For operational
claims about generation migration, exercise the real CLI and sync runtime against isolated Docker
PostgreSQL and Elasticsearch with the required ICU plugin. Scope the rehearsal to the changed
behavior; do not require all cases for an unrelated edit. Use synthetic data and record the source
revision, any future-version fixture override, process identities, checkpoint directory, commands,
and raw results. Cover the applicable cases:

- A multi-batch dataset: stop after a bounded batch, start a new process with the same checkpoint,
  and verify the same run ID, advancing cursor, and final active-document count.
- A completed repeat with source data static and sync inactive: compare per-session bulk events and
  ES indexing counters. Test a missing checkpoint separately; do not call its error a no-op.
- A per-entity upgrade with source insert/update/delete while backfilling: verify both generations,
  per-generation field pruning, and the unchanged live alias before promotion. Prove pending work
  blocks promotion, then drain and verify only the selected alias switches.
- Rollback while the previous generation remains available; close, fresh target-resolution cycle,
  and delete after returning to the declared generation.
- Additive in-place upgrade: same physical index, populated new field, cross-process resume, and no
  bulk writes on completed repeat. Check run progress as well as metadata.
- For deployment/concurrency changes, run same-directory and different-directory workers and report
  duplicate work or identity rejection separately from data correctness.

Keep deleted-document tombstones separate from active search counts. Do not infer crash-window
recovery, uninterrupted search under load, or hosted build persistence from a normal bounded pause.
Report measured payload size and timings without extrapolating a production completion time.
