---
name: cleanup-git-worktrees
description: 'Use for stale-worktree, Git registration and branch audits. Managed removal uses the repo lifecycle.'
---

# Cleanup Git Worktrees

Use the bundled script to make classification deterministic. Treat cleanup as a destructive action: audit first, show the exact candidates, and obtain explicit user approval before applying deletion unless the user's current request already names the exact targets.

## Workflow

1. Run the audit from any worktree in the repository:

   ```bash
   bash .agents/skills/cleanup-git-worktrees/scripts/cleanup.sh audit --fetch --base origin/canary
   ```

   Omit `--fetch` only when network access is unavailable; disclose that remote state may be stale.

2. Interpret classifications:

   - `protect-dirty`: preserve; it has modified or untracked files.
   - `protect-current`: preserve; never remove the worktree running the command.
   - `candidate-merged`: clean and fully contained in the base branch.
   - `candidate-gone`: clean and its configured upstream was pruned. This is stale, but not proof of merge after squash/rebase.
   - `review-no-upstream`: clean but lacks an upstream and is not contained in the base.
   - `active`: retain unless the user explicitly identifies it as finished.
   - `protected-branch`: never delete `main`, `canary`, or the base branch.

3. Present a compact table containing path, branch, dirty count, upstream state, base containment, and classification. Keep `candidate-merged` separate from `candidate-gone`; do not describe `[gone]` as proof of merge.

4. After approval, use the repository's worktree lifecycle workflow when it manages
   services or other resources alongside a checkout. The Git-only cleanup script
   does not tear those resources down. For plain Git worktrees, pass exact branch
   names to cleanup:

   ```bash
   bash .agents/skills/cleanup-git-worktrees/scripts/cleanup.sh clean \
     --base origin/canary \
     --branch feat/example \
     --branch fix/example \
     --apply
   ```

   Without `--apply`, cleanup is a dry run. The script re-audits every target immediately before deletion.

5. Run the audit again and report:

   - removed worktrees and branches;
   - retained dirty/current targets;
   - remaining worktree and local-branch counts;
   - any partial deletion or Git error.

## Safety rules

- Never discard dirty worktrees merely because their branch is merged or `[gone]`.
- Never use recursive deletion to bypass `git worktree remove`. If Git partially removes a directory, stop and inspect the exact path before deciding how to recover.
- Never force-delete a branch that is neither contained in the base nor `[gone]` through this script.
- A deleted upstream indicates staleness, not necessarily merge. Use GitHub PR state when the distinction matters.
- Preserve unrelated user changes and concurrent worktrees.
- Prefer `git fetch --prune origin` before classification and `git worktree prune` only for registrations whose directories are already missing.

## Script

Use `scripts/cleanup.sh`; do not recreate its parsing and guard logic ad hoc unless the repository layout makes it unusable.
