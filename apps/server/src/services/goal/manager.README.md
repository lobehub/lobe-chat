# CLI main Agent Goals

`lh goal create "Research objective" --agent <worker-id> --manager <main-agent-id> --requirement "Delivery contract" --max-manager-turns 12 --max-rounds 10`

The main Agent must have a working shell and an authenticated `lh` CLI in its
execution environment (for example a configured device Kimi/Codex Agent). Its
normal Agent configuration selects the runtime; dispatch uses the same
`execAgent` service as `lh agent run`. There is no exclusive supervisor tool set.
Use separate main/worker Agents so planning and execution have distinct roles.

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
can be unmetered, so a zero recorded cost is not proof of zero spend. The CLI uses
its existing authenticated user scope: turn binding protects the plan endpoint,
not the whole account or the operating system. Prompt instructions are not a
shell sandbox. Do not install a broad personal credential in an untrusted runtime.

Legacy `--supervise` Goals retain their existing behavior and cancellation fixes.
