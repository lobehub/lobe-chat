# Check assets and acceptance flows

A reusable check lives in `verify_criteria`, scoped to a user or workspace. Agent-generated plans and CLI ingests save checks automatically; there is no separate “save as template” step. A flow node references a check asset. Multiple nodes and flows may reuse the same asset without sharing execution results.

## Authoring a flow

Publish through `lh acceptance flow publish <acceptanceId> --file flow.json`. The input contains `definition` and, when updating, `flowId` plus the `expectedHash` returned by publish/view. A stale hash rejects the update instead of overwriting concurrent edits.

```json
{
  "definition": {
    "title": "Send a message",
    "goal": "Verify the composer and submission",
    "preconditions": ["Signed in"],
    "entryNodeId": "00000000-0000-4000-a000-000000000001",
    "nodes": [
      {
        "id": "00000000-0000-4000-a000-000000000001",
        "check": {
          "id": "00000000-0000-4000-a000-000000000002",
          "title": "Composer is available",
          "definition": {
            "fixtures": [{ "id": "message", "name": "Message input", "data": { "text": "Hello" } }],
            "steps": [
              { "id": "open", "instruction": "Open the conversation", "fixtureIds": ["message"] }
            ],
            "expected": "The composer is visible and accepts input"
          }
        }
      }
    ],
    "edges": []
  }
}
```

Each node supplies either `criterionId` for an existing asset or `check` for a new one. Use stable UUIDs for assets, nodes and edges. A new check ID is idempotent when its definition is unchanged; conflicting definitions are rejected. Update shared assets explicitly through `verify.updateCriterion`, or create a different asset when the verification goal differs. `verify.listCriteria` supports search/tags and excludes archived assets by default; `verify.getCriterionResults` returns scoped execution history.

An edge has `id`, `sourceNodeId`, `targetNodeId`, `trigger`, optional `condition`, and `required`. The graph must have exactly one entry and all nodes must be reachable. Cycles, self-loops and alternative branches are supported. Node overrides are restricted to required/onFail and fixture data bindings.

## Execute a round

1. `lh acceptance flow start <acceptanceId> --flow <flowId>` creates a fresh `verify_run`. Use `--run <verifyRunId>` to add the flow to an existing draft, or `--from-run <oldVerifyRunId>` to replay a frozen definition. Without `--from-run`, the current graph and assets are used.

2. Read the returned round through `lh acceptance view <acceptanceId> --json`. Its plan contains one item for entry and one for each incoming edge, including a return edge to entry. Results address these exact `checkItemId` values. Optional branches remain visible but do not block completion.

3. Exercise the actual product and record an observation with `lh acceptance flow record <acceptanceId> --file result.json`:

   ```json
   {
     "checkItemId": "<id from this round's plan>",
     "observation": "What was actually observed",
     "verdict": "passed",
     "verifyRunId": "<round UUID>"
   }
   ```

4. The returned `id` is the canonical check result ID. Attach evidence with `lh acceptance run evidence upload --check <resultId> --type screenshot --file evidence.png --by agent-browser`.

5. `lh acceptance flow complete <acceptanceId> --run <verifyRunId>` requires all mandatory plan checks to pass. This completes verification, not human acceptance. An identical record retry returns the existing result; changing a recorded flow result requires a new round.

Starting a round does not dispatch an Agent or imply verification occurred. The reviewer UI retains the original checklist and an optional flow tab, uses acceptance round numbers, and exposes neither start/rerun nor version-diff controls.

## Definition and history boundaries

`verify_runs.flow_snapshots` freezes topology; `verify_runs.plan` freezes resolved check definitions. Documents are copied into `resourceSnapshot`; file fixtures require a hash and retain the resource reference. Unavailable resources fail snapshot creation. Old snapshots are never reconstructed from mutable assets. Changing authored content produces a new check-item identity and explicit `supersedes` references to earlier checks at that position. Ordinary reruns keep the same identities.

Results, evidence and review decisions live only in the existing verify result/evidence tables. The graph groups branch results at their target nodes. There are no independent flow-version, flow-run or step-attempt tables. For presentation compatibility, the current bundle still exposes `versions` (round snapshots/current draft) and `attempts` (canonical check results); these are computed views, not additional persisted entities or visit traces.

Asset archival hides it from discovery while preserving explicit references. Removing an acceptance deletes its flow definitions, not its check assets. The node-to-asset foreign key prevents deleting an in-use asset; it is deferred to transaction commit to allow account/workspace cascading deletion to remove all dependent objects.

See [the schema design](./acceptance-check-assets.md) for the field map and migration decisions.
