# CLI main Agent Goals

`lh goal create "Research objective" --agent <agent-id> --requirement "Delivery contract" --max-manager-turns 12 --max-rounds 10`

The main Agent must have a working shell and an authenticated `lh` CLI in its
execution environment (for example a configured device Kimi/Codex Agent). Its
normal Agent configuration selects the runtime; dispatch uses the same
`execAgent` service as `lh agent run`. There is no exclusive supervisor tool set.
Manager mode is explicit: pass `--max-manager-turns` through the CLI or
`config.manager` through the API after ensuring the Agent has a working CLI.
The application tool supplies `createdByAgentId`; the CLI inherits
`LOBEHUB_AGENT_ID`. A person creating a Goal uses the selected `--agent` instead.
No separate manager identity is accepted. Without explicit planning options,
ordinary unseeded goals keep the coordinator planner. Seed/exploration/legacy
supervision paths retain their existing planning behavior. Task assignees can
differ, and changing them does not replace the configured main Agent.

The main Agent reads `lh goal show`, `lh task view`, `lh topic view`, and document
commands. It submits a JSON file through `lh goal plan <goal-id> --token <turn> --file plan.json`. The runtime supplies `LOBEHUB_OPERATION_ID`. Plan actions:

- `tasks`: reason and 1–10 objects with title/description. All existing work must
  first be settled. The coordinator creates and runs ordinary Tasks.
- `verify`: reason; requests the ordinary independent final acceptance Task.
  This does not mark the Goal achieved.
- `retry`: reason (checkpoint-aware recovery instruction), taskId and exact
  failedOperationId. Only the existing confirmed transport-failure policy permits
  retry, with Task attempt limits and Goal budget checks.
- `escalate`: concrete reason; pauses the Goal for a person.

A row-locked server receipt binds each turn to its Goal, configured Agent,
Topic, source-message identity and graph snapshot. First submission wins; a
repeat cannot replace it or create duplicate Tasks. Stopped Goals, human Gates,
stale input and unrelated operations reject writes. Work is not dispatched until
the main turn's terminal operation is observed. A backend losing the dispatch
response adopts the operation through its stable source-message identity.

The main Agent owns initial and subsequent planning. Manager mode cannot be
combined with seed Tasks, exploration or the legacy opt-in supervisor. Neither
the old decomposition model nor exploration planner runs during its planning
turns. Execution, delivery verification and human Gates remain coordinator-owned.
Read `config.managerState` in the Goal graph for the current receipt and Topic.

Wakeups use the existing Goal scheduler (queued mode for restart durability).
After a confirmed terminal main operation without a plan, another turn can
reread the durable graph within the turn budget. An unconfirmed running/missing
operation times out after 20 minutes and pauses without launching a replacement;
confirm its exit before resuming. Parked human/async-tool operations retain
ownership; a human wait is surfaced without starting another planning turn.
Deletion pauses under a row lock, cancels the latest main turn, and checks that
no concurrent resume or new claim occurred before removing the Goal. This is not worker-process resurrection or a
persistent device process journal. A committed plan survives an errored ending,
but coordinator dispatch still waits for that terminal operation.

Manager turns are capped separately (default 12, maximum 100); recorded manager
cost/tokens are included in detailed Goal spend. External subscription execution
can be unmetered, so a zero recorded cost is not proof of zero spend. The CLI sends operation-token plan submissions to a dedicated ingestion endpoint,
which checks the live operation principal and then the Goal turn binding. Normal
user credentials retain the existing scoped endpoint. Prompt instructions are not a
shell sandbox. Do not install a broad personal credential in an untrusted runtime.

Legacy `--supervise` Goals retain their existing behavior and cancellation fixes.

Each new planning turn includes up to 20 recent Task comments (2,000 characters
per comment); the main Agent can read full comments through `lh task view`. A
comment digest rejects uncommitted plans when feedback changed since dispatch.
That check is optimistic at read time: concurrent comment writes do not share
the Goal lock, and feedback arriving after a committed plan does not stop
already dispatched work. Stale feedback requires a new bounded planning turn.

The accepted `verify` reason is persisted in the final Task's description as
main-Agent handoff context. This keeps document corrections and evidence notes
available to both the first delivery and repair attempts. The original Goal
requirement remains authoritative; handoff assertions are not acceptance evidence
or permission to weaken its criteria.
