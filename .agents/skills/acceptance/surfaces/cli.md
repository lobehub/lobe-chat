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
2. Capture the output and upload it as `text` evidence — inline with `--content`
   for short output, or `--file` for a larger dump.

```bash
# CHECK_ITEM_ID is the criterion's plan item id (from `lh verify plan state`).
# short result → inline
lh acceptance run result submit --operation "$OPERATION_ID" --item "$CHECK_ITEM_ID" --type text \
  --content "$(your-cli command --json)" \
  --by cli --desc "command reports the new field after the change"

# larger output (test log, full dump) → file
your-cli command --json > ./proof/result.json
lh acceptance run result submit --operation "$OPERATION_ID" --item "$CHECK_ITEM_ID" --type text \
  --file ./proof/result.json --by cli --desc "full result set"

# a test run is itself proof
your-test-runner path/to/spec > ./proof/test.log 2>&1
lh acceptance run result submit --operation "$OPERATION_ID" --item "$CHECK_ITEM_ID" --type text \
  --file ./proof/test.log --by program --desc "regression spec passes"
```

Provenance: `cli` for command stdout, `program` for a script/test you ran. See
[../references/evidence.md](../references/evidence.md) for the evidence contract.

## Terminal evidence (preview)

> **Preview** — needs an `lh` built from the LobeHub branch that adds
> `lh acceptance run evidence capture|import` (check with
> `lh acceptance run evidence capture --help`). With an older `lh`, use the
> `text` flow above. Do not run `lh acceptance update` while previewing: it
> replaces this copy from upstream.

When the criterion is "this command does X", publish the execution itself as
`terminal` evidence instead of a pasted log. The page shows a command card —
command, cwd, exit status, duration, whether it was captured, imported or
authored — with stdout and stderr apart, and a read-only replay when the run was
recorded in a pty.

```bash
# Run it and capture (pipe: stdout/stderr apart; nothing is uploaded yet)
lh acceptance run evidence capture --out .acceptance/ev/list -- lh agent list --json

# A TUI, progress bar, or anything that draws: record a real terminal session
lh acceptance run evidence capture --mode pty --out .acceptance/ev/tui -- your-cli interactive

# Pipes, globs, &&: run through the shell
lh acceptance run evidence capture --shell --out .acceptance/ev/build -- 'bun run build && ls dist'

# Read the bundle (transcript.txt, terminal.json), then publish it
lh acceptance run result submit --operation "$OPERATION_ID" --item "$CHECK_ITEM_ID" \
  --terminal .acceptance/ev/list --desc "agent list returns the new field"
```

You already ran the command through your own shell tool? Don't run it again just
to upload — import the real output and state only what you actually know:

```bash
lh acceptance run evidence import --out .acceptance/ev/migrate \
  --input ./migrate.log --command 'bun run db:migrate' --exit-code 0 --tool Bash
```

- `capture` exits 0 whenever the bundle was written. The command's own exit
  status, signal, or timeout is in the record — read the summary, don't assume.
- Leave unknown facts unknown on import: no `--exit-code` unless you saw it.
  `--source authored` marks a hand-written example. It may explain things, but it
  never satisfies a check whose `requiredEvidence` says
  `"provenance": "execution"`.
- Bundles are redacted before they are written (secret-looking env values,
  tokens, auth headers, URL credentials, your home path); add `--redact <text|/re/>`
  for anything else. A bundle edited after it was written is refused at upload —
  capture or import again instead.
- In a report, list the bundle directory as a case's evidence path and
  `lh acceptance run ingest` publishes it as one `terminal` evidence. Require it in
  the plan with `{ "type": "terminal", "provenance": "execution" }`.
- A missing pty in the installed CLI is an error, never a silent fallback. If you
  choose `--mode pipe` instead, the evidence says pipe and records no terminal
  behavior.

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
  [../references/evidence.md](../references/evidence.md#artifact-safety). Terminal
  bundles are redacted locally, but read `transcript.txt` before publishing.
