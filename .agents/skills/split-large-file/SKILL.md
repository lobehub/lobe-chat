---
name: split-large-file
description: 'Refactor a source file over 800 lines into a directory of cohesive modules without changing behavior, test-first. Use when asked to split, decompose, or shrink a large file (拆分大文件, 拆文件, 重构大文件); with no file given, pick one.'
---

# Split a Large File

Split one file into a directory of modules without changing behavior. Where the pieces go, what they are named, and where tests live are owned by `source-layout`; read it first. This skill owns the procedure: lock behavior with tests, move, extract, then split the tests.

The split changes no behavior. If you find a bug on the way, note it and fix it in a separate commit or PR after the split.

## 1. Pick the file

Given a file, use it. Otherwise build a shortlist:

```bash
git ls-files -z -- 'src/*.ts' 'src/*.tsx' 'apps/*.ts' 'apps/*.tsx' 'packages/*.ts' 'packages/*.tsx' \
  | rg --null-data -v '(^|/)(__tests__|__mocks__|fixtures|locales)/|\.(test|spec)\.|\.d\.ts$' \
  | xargs -0 wc -l | awk '$1 > 800 && $NF != "total"' | sort -rn | head -30
```

The shortlist still contains data tables and generated code; filter it by reading. Prefer a file with:

- **A real extraction boundary**: hand-written logic with separable state, sub-domains, or stages, not a lookup table.
- **A repeatable verification surface**: behavior that unit or integration tests can observe (including the real-database tests `testing` requires for models), not one that needs a browser session or live third-party calls.
- **A reviewable scope**: one PR can hold the split. When this repository is mounted as a submodule, split a file of the submodule only through a PR to the submodule.

Use recent churn (`git log --since=3.months --oneline -- <file> | wc -l`) only to break ties. State the choice and the reason before starting.

## 2. Read and plan

Read the whole file and its tests. Find every reference with `rg` on the module path and basename across source roots: imports, re-exports, dynamic `import()`, `vi.mock('…/Foo')`, explicit extensions, and package entry mappings.

Write a short plan before editing:

- the real boundaries (state, reuse, render update, sub-domain, pipeline stage — see `react` and `source-layout` §3) and the module each becomes;
- the directory layout from `source-layout` §4, with expected line counts;
- duplicated branches that will collapse into one module, if any;
- each behavior the split moves or merges, mapped to the test that will guard it.

When a boundary or layout decision is unclear, ask an independent reviewer (a different-vendor harness when available) to critique the plan.

## 3. Lock the behavior with characterization tests

Existing tests usually cover the happy path and miss the branches a split is most likely to break. Before editing, record the baseline commit and the original path, then:

1. Run the existing tests by explicit path; record the pass count.
2. Pin every branch whose code or branch selection the split changes or merges (each CTA state, early return, error path), through the public entry: rendered labels and disabled states for a component, return values and calls for a service. Name the state or mock that reaches each branch; a stub that renders `null` cannot drive the branch behind it. For a component this is the `testing` exception for characterization tests. Prefer one table test (`it.each`) with expected values written out; inline snapshots do not work inside `it.each`, and a file snapshot of raw markup hides what it asserts.
3. Run the new tests against the original code and record the result. If extraction already started, restore the original **in its original directory** so its relative imports resolve (`git show <baseline>:<path> > <dir>/<Name>Original.tsx`), point the test import at it, run, then point it back and delete only that copy.
4. Mutation smoke check: break one guarded branch (for example make an `if` condition `false`), confirm a named test fails, undo exactly that edit, and confirm the test passes again. One mutation shows the tests are sensitive, not that coverage is complete.

Behavior the split moves unchanged and that had no test before stays "uncovered before and after"; say so in the PR instead of claiming it is guarded.

## 4. Move first, in its own commit

Move the file and its tests together (`git mv Foo.tsx Foo/index.tsx`, `git mv Foo.test.ts Foo/index.test.ts`). Rewrite only relative module specifiers in imports, `vi.mock`, and dynamic imports; run the tests by explicit path, and commit. Large extraction in the same commit lowers content similarity until Git stops detecting the rename. A separate move commit keeps the extraction diff reviewable on its own; a squash merge folds both commits together.

## 5. Extract along the plan

Extract one boundary at a time and rerun the guard tests by explicit path after each:

- Pure functions to `utils.ts` (or a named module) with explicit parameters instead of closures over component state.
- For React components, a cohesive `useXxx.ts` when transitions, side effects, or handlers obscure rendering or form a reusable unit; otherwise keep state in its smallest owner (`react`). For services, routers, and stores, use the matching row of `source-layout` §4.
- Child components to PascalCase siblings with named exports.
- A constant stays in the module that uses it; one shared by several extracted modules goes to the nearest common directory's `const.ts`.

Keep the public import path and exported names unchanged so callers do not change. Every resulting file must be at most 800 lines, and the entry should read as composition, not logic.

## 6. Split and trim the tests

When the test file is large or covers distinct scenarios, split it by scenario (`index.render.test.ts`, `index.actions.test.ts`, …) with shared mocks in `testUtils.ts`, as `source-layout` §2 describes.

Preserve every observable behavior the old suite asserted. Remove a test or assertion only when it duplicates a named retained test, is coupled to implementation details (`testing` lists these), or checks an expectation that is demonstrably obsolete; record each removal and its replacement or evidence in the PR. Merge near-identical tests into `it.each`, and drop mock branches and translation keys nothing renders.

## 7. Verify and deliver

```bash
wc -l <dir>/*   # every file ≤ 800
bun run check <every changed source file> <every guard test file> --lint --test --type
```

Pass the test files explicitly: related-test discovery only finds `<name>.test.*`, so `index.tsx` does not run `index.<scenario>.test.ts`. Confirm the reported test count matches the suites you expect.

Then follow the normal task lifecycle: a light `deep-review` (suggest Deep when the file is on a high-risk surface such as billing or auth), `commit`, and `pr`. A pure split needs no product acceptance; state that reason in the PR body together with:

- the commits (move, extraction) so reviewers can read the extraction alone;
- the baseline run of the characterization tests and the mutation result;
- removed tests with their replacement, and behavior left uncovered before and after.
