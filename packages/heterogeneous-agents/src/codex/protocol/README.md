# Codex app-server protocol

`generated.ts` vendors the stable TypeScript protocol emitted by Codex at revision
`5e32f728f1f86a967c6be057351f12505778df8f`. `threadLifecycle.gen.ts` vendors the `thread/fork`,
`thread/read`, and `thread/archive` types from `codex-cli 0.154.0`; their stable shapes are
unchanged in `0.160.0`. It imports shared types from `generated.ts`.

Generate the upstream files with:

```bash
codex app-server generate-ts --out <directory>
```

The `ThreadUnsubscribe*` types come from the same command run by Codex CLI 0.160.0, where
`thread/unsubscribe` is part of the stable request set.

The vendored files are the transitive stable subset used by LobeHub's native app-server client. Keep
wire names and nullability identical to the generated files; do not hand-edit protocol types.
