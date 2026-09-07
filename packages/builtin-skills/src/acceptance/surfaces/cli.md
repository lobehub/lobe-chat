# CLI / backend surface

The default surface for backend, CLI, library, and data-logic changes. The proof
is the command's own output — text, not pixels. This is the cheapest and strongest
evidence: a passing assertion or a correct JSON result is harder to fake than a
screenshot, and it runs anywhere (no browser, no display).

Use this surface when your change is verifiable by running something and reading
what it prints. Return to the surface router only when the criterion is actually
about rendered UI.

## How to verify

1. Run the command, test, or query that exercises the change. Prefer a machine
   output mode (`--json`, a structured dump) so the proof is assertable, not prose.
2. Save the output as `text` evidence in the current attempt directory, using the
   storage contract in [evidence.md](../references/evidence.md#capture-first-publish-after-review).
3. After the primary reviews the complete round, the primary publishes the saved
   artifact. The commands below separate capture from plan-driven publication;
   authored rounds instead include the artifact in their report.

```bash
# Worker: capture the actual product command's output, not a test-suite verdict.
your-cli command --json > "$EVIDENCE_DIR/result.json"

# Primary: publication only, after reviewing the completed round.
# First read the current reviewed attempt from attempt-ledger.json. Replace these
# placeholders with that record's values in the primary's own shell.
ARTIFACT_PATH='/absolute/path/from/ledger/result.json'
ATTEMPT_ID='reviewed-attempt-id-from-ledger'
TESTED_REVISION='tested-revision-from-ledger'
# CHECK_ITEM_ID is the criterion's plan item id (from `lh verify plan state`).
lh acceptance run result submit --operation "$OPERATION_ID" --item "$CHECK_ITEM_ID" --type text \
  --file "$ARTIFACT_PATH" --by cli \
  --desc "Attempt $ATTEMPT_ID at $TESTED_REVISION: command reports the new field"
```

Provenance: `cli` for command stdout, `program` for a script/test you ran. See
[../references/evidence.md](../references/evidence.md) for the evidence contract.

## Auth

The `lh` CLI you upload with is already authed. A _different_ product CLI under
test carries its own auth (API key or stored login) — configure it before
capturing its output, and verify the credential belongs to the intended test
environment.

## Boundaries

- **Don't open a browser for a backend change.** If the criterion is satisfied by
  output, a screenshot adds noise, not proof.
- **Make the assertion legible.** Upload the specific lines/fields that prove the
  criterion (or describe them in `--desc`), not a 10k-line log the reviewer must
  scan.
- **Never upload secrets.** Strip tokens/keys from output before uploading — see
  [../references/evidence.md](../references/evidence.md#artifact-safety).
