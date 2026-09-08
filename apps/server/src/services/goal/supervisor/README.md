# Goal supervision (experimental)

Enable on a new Goal with `lh goal create <title> --supervise` or
`config.supervision.enabled = true` on `goal.create`. Inspect the independent
Topic, incidents, operation links and metrics with `lh goal supervision <id>`.
Existing Goals keep their original behavior unless explicitly enabled at creation.

The first version covers confirmed transport failures of a failed Task's latest
error operation. It does not automatically resolve an existing human Gate,
recover credentials, increase budgets, replace providers, change acceptance,
repair/deploy the platform or diagnose arbitrary failures. This is a subset of
the proposed general Goal supervisor, not a claim of unattended long-horizon
operation. Agent-authored failures without a persisted operation are outside it.

A virtual native agent diagnoses the failure in a separate durable Topic with
all tools disabled. Its only accepted output is a validated retry/escalate
recommendation. The server rechecks Goal status, pending decisions, current
Task/run identity, original Task attempt limits and Goal budgets before queuing
recovery through the ordinary dispatcher. Recovery instructions require checking
and reusing saved work and reconciling external side effects before replay. This
instruction is not an exactly-once guarantee for arbitrary external systems.

A five-second scheduled Goal advance checks the asynchronous diagnosis. Existing
sweep infrastructure provides the fallback if the callback is lost. Queue mode
is required for durable wakeups; local in-process timers alone cannot survive a
restart. A lost diagnostic dispatch response can be adopted from the dedicated
Topic using the server-minted incident message identity (not timestamps). An unfinished diagnosis expires after ten minutes and opens the existing
human Gate; automated recovery of a broken supervisor is not yet implemented.
The diagnostic Topic is not a graph Task and cannot prevent terminal acceptance.

The server-owned `config.supervisorState` holds a revisioned incident ledger and
Topic identity. Compare-and-swap and row locks protect transitions. Policy writes
preserve that namespace. `maxIncidents` bounds stored incidents and diagnostic
calls (default 10, maximum 100); exhausting it escalates subsequent failures.
This JSONB storage intentionally needs no migration for the bounded prototype.
An unbounded multi-month history should use a paginated incident table instead.

Diagnostic spending is included in Goal graph spending and budget checks; Task
attempt/round accounting remains unchanged. Each diagnostic run is additionally
capped at three agent steps. Goal list rollups still describe Task spending;
the detailed graph includes supervision costs.

## Measurement

`effectiveRecoveryRate = effectiveRecoveries / eligibleInterruptions` (null for
an empty eligible sample). `interruptions` includes the recorded ineligible cases
so the supported subset remains visible. Incidents beyond the bounded ledger,
missing-operation failures, and pre-existing human Gates are not part of this
sample. This rate is not overall interruption coverage or a counterfactual claim
that every eligible incident would otherwise need human prompting.

Diagnosis and retry dispatch are pending, not successful. Only the completed
delivery actually consumed by the Goal can count, and the run history between
failure and delivery must be Goal-triggered. Human retries do not count. A newer
cancelled retry cannot take credit for an earlier delivery. A later accepted
Goal-triggered run can reconstruct the dispatch receipt after a process restart.
A second execution failure closes the previous retry as unsuccessful.

The paired acceptance scenario measures user-prompt elimination separately:
identical injected failure and saved output, supervision disabled versus enabled,
then actual queued diagnosis, Task execution and verification. Boundary evidence
is reported independently; a high recovery rate cannot compensate for a user
pause, approval or budget violation.
