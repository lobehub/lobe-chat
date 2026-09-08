# Agent-authored acceptance flows

Before verifying a user-facing task, the builder agent publishes a state graph:

1. Read the task and product behavior. Author `definition` with title, goal,
   preconditions, entryNodeKey, nodes and edges. Each node has key/title/instruction/
   expected; each edge has key/source/target/trigger/required and optional condition.
   Include required recovery branches. Do not invent observations at this stage.
2. `lh acceptance flow publish <acceptanceId> --file flow.json` publishes an
   immutable version. Pass `flowId` in the file to publish a new version.
3. `lh acceptance flow start <acceptanceId> --flow-version <versionId> --run <verifyRunId>`
   binds that version to an existing open acceptance verification round. Omit `--run` to create a fresh round.
4. Operate the real product. Append each observed visit with
   `lh acceptance flow record <acceptanceId> --file visit.json`. The JSON contains
   flowRunId, nodeKey, requestId (unique, stable across network retries), verdict
   (passed/failed/uncertain/blocked) and observation. A path starts at the entry;
   subsequent visits also provide incomingEdgeKey and previousAttemptId.
   A passed failure-state node means the product handled the failure as expected.
5. The response includes checkResultId and id (the immutable attempt id).
   Attach artifacts to this exact result without replacing the visit:
   `lh acceptance run evidence upload --check <checkResultId> --type screenshot --file evidence.png --by agent-browser`.
6. `lh acceptance flow complete <acceptanceId> --flow-run <flowRunId>` succeeds
   only after the entry and every required edge's latest attempt pass. Optional
   paths remain visible as unverified. A completed flow is not human acceptance.
7. The reviewer opens the acceptance's User flow tab, selects nodes or edges,
   examines attempts and evidence, and records an independent human review.

A new verification round gets a new flow run. Never overwrite published versions
or prior visits to make a repair look like the original execution.

## Definition comparison and reviewer feedback

The version comparison UI is temporarily hidden pending design review. Its comparison logic matches `nodeKey` and `edgeKey`, not per-version row IDs. It compares authored fields only (including entry point, expected result, endpoints and branch conditions), preserves deleted definitions in the comparison, and never presents an old execution as verification of a changed expectation. Agents must retain keys for the same logical state and allocate new keys for replacement states.

Flow reviews reuse the evidence annotation modal. Regions and uploaded file IDs are stored in the attempt's existing check result `userDecisionDetail`, scoped to that attempt's screenshots, and returned in the bundle. `lh acceptance feedback` includes these records; only the latest attempt for the branch in the current version/run is actionable. Earlier feedback remains readable without becoming the current verdict.

## Reusable definitions and per-run checks

A flow node is an immutable check definition owned by a flow version. Publishing a
version does not create results or imply that verification has started. Starting a
flow copies every node into that verification round's `verify_runs.plan`, with
`sourceFlowNode` identifying the definition, version and stable node key. The
logical check ID is scoped by flow ID and node key, so histories align across runs.

`startFlow` accepts an existing round, or creates a fresh round when omitted. The
CLI creates a round with pending checks; it does not dispatch an agent or
claim that the product has been exercised. The reviewer UI exposes neither start nor rerun actions. The agent records the actual
observations with the existing flow CLI. A repeated start for the same version
and round is idempotent; a new round has no results or inherited review decisions.

Path attempts remain immutable execution records with their own result/evidence
snapshots. `projectFlowCheckResults` folds the latest required incoming paths into
one per-node outcome for the standard acceptance union. A failure dominates; a
missing required path is uncertain, never passed. Historical attempts remain
accessible through the graph. The normal checklist is the canonical interaction:
expand, filters, evidence, comments and round history are reused, rather than
rendering a second kind of checklist row.

For flow-backed checks only, planning a rerun resets the current result and makes
prior reviews historical. Ordinary acceptance checks retain their established
carry-forward behavior. The new round and graph show dashed circles until there
is an observation. Definitions can be reused within the owning acceptance; a
cross-project asset catalog and automatic agent dispatch are separate features.

## Reviewer navigation

The flow tab is shown only when a populated graph exists; otherwise the page retains its normal checklist and files tabs. If graph data disappears while selected, the active view falls back to the checklist. Reviewers select acceptance rounds using the same round numbers as the checklist. Internal version/run identifiers stay behind this single selector; the chosen round resolves its immutable definition and attempts. A published definition with no run remains available as a pending verification plan.
