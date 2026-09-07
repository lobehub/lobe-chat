# Plan-driven rounds — discover, submit, self-check

Use this path only when the invocation handed you an operation id: a verify plan
already exists and you satisfy it criterion by criterion. Authoring your own
checks (the default) is [report.md](./report.md). Never mix both for one round.

`--operation` and `--run` are interchangeable on `result submit` and
`result list`; `evidence list` keys off a positional `<checkResultId>` from
`result list`.

## (a) `lh verify plan state $OPERATION_ID --json`

Returns the run's verify state plus the **frozen plan** (immutable once
confirmed):

```jsonc
{
  "verifyStatus": "planned",
  "verifyPlanConfirmedAt": "2026-06-21T07:00:00.000Z",
  "verifyPlan": [
    {
      "id": "vci_a1b2c3", // checkItemId — the stable join key
      "index": 0,
      "title": "Login flow reaches the workspace",
      "description": "After sign-in the home renders the workspace switcher",
      "required": true, // true ⇒ blocks delivery if unproven
      "verifierType": "llm",
      "verifierConfig": {
        "requiredEvidence": [
          // the artifacts you MUST capture
          { "type": "screenshot", "hint": "logged-in home with workspace switcher" },
        ],
      },
    },
  ],
}
```

- `verifyPlan[].id` is the **checkItemId** — never use `index` as a key, it is
  display ordering only.
- `verifyPlan[].verifierConfig.requiredEvidence` is the list of `{ type, hint }`
  you must satisfy. Absent or empty ⇒ this criterion is judged on text alone.
- `hint` is guidance for what the artifact should show — it is not validated, but
  follow it so the reviewer can recognize the proof.

Only items with a non-empty `requiredEvidence` need an artifact; the rest are
judged on the deliverable text — don't fabricate evidence for them. The `hint`
usually implies the surface (SKILL.md, Pick the surface).

## Review before submission

The execution worker captures evidence locally for the complete agreed plan. Use
the [storage and retention contract](evidence.md#capture-first-publish-after-review)
for the round directory, attempt artifacts, and `attempt-ledger.json`. Use
the attempt ledger from [delegation.md](delegation.md): each rerun has a new attempt
ID and separate artifacts. Do not call `result submit` during case execution.
The primary reviews the completed evidence before submitting any results, without
intermediate approval per case or a separate audit agent.

Submit only the reviewed current attempt for each item. Include its attempt ID
and tested revision in the evidence description so it maps back to the ledger.
`checkItemId` identifies the criterion, not an execution attempt; server row reuse
does not preserve or supersede local attempts. Keep discarded attempts locally
and do not upload them as current evidence.

If a repair invalidates evidence already submitted to this run, use a new
plan-driven run through the caller's or project's supported workflow. Do not
overwrite the old round or mix repair attempts into it. If no supported way to
obtain that run is available, report the publication blocker while retaining the
new evidence; do not invent flags or silently switch to authored ingestion.

## Reviewed worklist → submit by checkItemId

After the primary's review, for each `verifyPlan[]` item with non-empty
`requiredEvidence`, submit the reviewed artifacts **one artifact per call** by
`checkItemId` (the same `--item` reuses the row):

| checkItemId  | title                            | requiredEvidence |
| ------------ | -------------------------------- | ---------------- |
| `vci_a1b2c3` | Login flow reaches the workspace | `screenshot`     |

```bash
OP="$OPERATION_ID"
lh acceptance run result submit --operation "$OP" --item vci_a1b2c3 --type screenshot \
  --file ./proof/home.png --by agent-browser --desc "…"
```

`lh acceptance run result submit` resolves the session from the operation id and **creates the
check-result row for you** (idempotent on `checkItemId`), then attaches the
evidence — there is no `checkResultId` to look up first. `--by` records
provenance (`agent-browser` | `cdp` | `cli` | `program`); `--file` for binaries,
`--content` for text, exactly one. Leave the verdict to the plan's configured verifier;
the primary's evidence review does not replace that verifier. Add
`--verdict` only when the task explicitly asks you to self-assert. Keep the
printed run URL internal.

The primary also records the reviewed role/run/model provenance and limitations
in this round's narrative with `lh acceptance run report upsert --run "$VERIFY_RUN_ID" --content "$REVIEWED_NARRATIVE"`.
After submission, read `lh acceptance run result list --operation "$OP" --json`
and set `VERIFY_RUN_ID` from the returned rows' `verifyRunId`, not their `id` or
the operation ID. Confirm the rows belong to the intended single round; if no
rows exist or the run is ambiguous, resolve that before writing the narrative.
Omit `--verdict` unless self-assertion was explicitly
requested. This is part of initial publication, not permission to rewrite a
published round after a repair.

## Self-check coverage (do not skip)

Once you've submitted, the result rows exist. Map each `checkItemId` to its
`checkResultId` and list that row's evidence:

```jsonc
// lh acceptance run result list --operation "$OP" --json
[
  {
    "id": "vcr_x9y8z7", // checkResultId (created by submit)
    "verifyRunId": "vrn_a1b2c3", // report upsert --run uses this value
    "checkItemId": "vci_a1b2c3", // joins back to verifyPlan[].id
    "status": "running",
  },
]
```

```bash
lh acceptance run evidence list "$CHECK_RESULT_ID" --json # confirm each required type is present
```

Coverage rule: for each required criterion, **every** `requiredEvidence[].type`
appears at least once in its evidence list. A missing upload → retry with the
same reviewed artifact. Missing captured evidence → return to the executor and
have the primary review the supplement before submission; a rerun must follow
the attempt and round rules above. Then hand off per SKILL.md
(acceptance URL + `coverage: n/n`).
