// GENERATED CODE! DO NOT MODIFY BY HAND!

// Bundled from `codex-cli 0.154.0` `codex app-server generate-ts` output. See README.md.

import type {
  AbsolutePathBuf,
  ApprovalsReviewer,
  AskForApproval,
  JsonValue,
  LegacyAppPathString,
  ReasoningEffort,
  SandboxMode,
  SandboxPolicy,
  Thread,
  ThreadSource,
} from './generated';

// Source: v2/ThreadArchiveParams.ts
export type ThreadArchiveParams = { threadId: string, };

// Source: v2/ThreadArchiveResponse.ts
export type ThreadArchiveResponse = Record<string, never>;

// Source: v2/ThreadForkParams.ts
/**
 * There are two ways to fork a thread:
 * 1. By thread_id: load the thread from disk by thread_id and fork it into a new thread.
 * 2. By path: load the thread from disk by path and fork it into a new thread.
 *
 * If using a non-empty path, the thread_id param will be ignored.
 * Empty string path values are treated as absent.
 *
 * Prefer using thread_id whenever possible.
 */
export type ThreadForkParams = {threadId: string, /**
 * Optional last turn id to fork through, inclusive.
 *
 * When specified, turns after `last_turn_id` are omitted from the fork.
 * The referenced turn cannot be in progress.
 */
lastTurnId?: string | null, /**
 * Configuration overrides for the forked thread, if any.
 */
model?: string | null, modelProvider?: string | null, serviceTier?: string | null | null, cwd?: string | null, approvalPolicy?: AskForApproval | null, /**
 * Override where approval requests are routed for review on this thread
 * and subsequent turns.
 */
approvalsReviewer?: ApprovalsReviewer | null, sandbox?: SandboxMode | null, config?: { [key in string]?: JsonValue } | null, baseInstructions?: string | null, developerInstructions?: string | null, ephemeral?: boolean, /**
 * Optional client-supplied analytics source classification for this forked thread.
 */
threadSource?: ThreadSource | null, /**
 * When true, return only thread metadata and live fork state without
 * populating `thread.turns`. This is useful when the client plans to call
 * `thread/turns/list` immediately after forking. Full-history hydration
 * is deprecated for paginated threads; use this with `thread/turns/list`
 * and `thread/items/list` instead.
 */
excludeTurns?: boolean};

// Source: v2/ThreadForkResponse.ts
export type ThreadForkResponse = {thread: Thread, model: string, modelProvider: string, serviceTier: string | null, cwd: AbsolutePathBuf, /**
 * Environment-native paths to instruction source files currently loaded for this thread.
 */
instructionSources: Array<LegacyAppPathString>, approvalPolicy: AskForApproval, /**
 * Reviewer currently used for approval requests on this thread.
 */
approvalsReviewer: ApprovalsReviewer, /**
 * Legacy sandbox policy retained for compatibility. Experimental clients
 * should prefer `activePermissionProfile` for profile provenance.
 */
sandbox: SandboxPolicy, reasoningEffort: ReasoningEffort | null};

// Source: v2/ThreadReadParams.ts
export type ThreadReadParams = { threadId: string,
/**
 * When true, include turns and their items from rollout history.
 * Full-history hydration is deprecated for paginated threads; prefer a
 * metadata-only read and page with `thread/turns/list` and
 * `thread/items/list`.
 */
includeTurns?: boolean, };

// Source: v2/ThreadReadResponse.ts
export type ThreadReadResponse = { thread: Thread, };
