/**
 * Channel: a shared conversation where people and Agents talk together (LOBE-15104).
 *
 * Channel identities never alias Agent Group, Topic, Task or Operation identities. Public
 * messages live in `channel_messages`; each Agent's private transcript lives in
 * `channel_runtime_messages` and is never shown to anyone.
 */

export const CHANNEL_RUNTIMES = [
  'native',
  'codex',
  'amp',
  'grok-build',
  'claude-code',
  'pi',
] as const;
export type ChannelRuntime = (typeof CHANNEL_RUNTIMES)[number];

export const isChannelRuntime = (runtime: string): runtime is ChannelRuntime =>
  (CHANNEL_RUNTIMES as readonly string[]).includes(runtime);

/** Discoverability inside a workspace. Ignored for personal channels (`workspace_id IS NULL`). */
export type ChannelVisibility = 'private' | 'public';

export type ChannelMemberActorType = 'agent' | 'user';

/** Role of a human member. Agent members carry no role. */
export type ChannelMemberRole = 'admin' | 'member' | 'owner';

export interface ChannelMemberConfig {
  agentId?: string;
  avatar?: string;
  backgroundColor?: string;
  deviceId?: string;
  /**
   * User whose device runs this member. Device calls route by this id, never by the channel
   * creator, so a workspace channel can use another member's device after its owner approves.
   */
  deviceOwnerId?: string;
  model: string;
  provider: string;
  runtime: ChannelRuntime;
  systemRole?: string;
  /** Set only from a device's canonical-path acknowledgement before claiming work. */
  workingDirectory?: string;
}

/**
 * - `directed`: carried explicit @mentions; jobs were created in the send transaction.
 * - `pending`: waiting for Jev to pick responders.
 * - `assigned`: Jev (or the no-model fallback) picked at least one Agent.
 * - `unassigned`: Jev was unsure or failed; no Agent was woken and the user may retry.
 * - `skipped`: Jev decided nobody needs to reply. Not a failure.
 * - `reply`: an Agent's published reply; replies never enter routing.
 */
export type ChannelMessageRoutingStatus =
  'assigned' | 'directed' | 'pending' | 'reply' | 'skipped' | 'unassigned';

/**
 * - `explicit`: recipients came from @mentions or Thread followers.
 * - `jev`: recipients came from a `decide()` call.
 * - `fallback`: no decision model is configured, so every available Agent was picked.
 */
export type ChannelMessageRoutingSource = 'explicit' | 'fallback' | 'jev';

export type ChannelJobStatus = 'cancelled' | 'completed' | 'failed' | 'queued' | 'running';

/** Why a queued job cannot start yet. Typed so clients never infer it from error text. */
export type ChannelJobBlockCode =
  | 'device_approval_pending'
  | 'device_offline'
  | 'directory_locked'
  | 'unavailable'
  | 'workspace_changed';

export type ChannelRunStatus =
  | 'completed'
  | 'execution_unknown'
  | 'failed'
  | 'running'
  | 'starting'
  | 'stop_requested'
  | 'stopped';

export type ChannelRunActivity = 'running' | 'typing';

/** Whether the runtime confirmed it took the input; `unknown` runs are never redelivered. */
export type ChannelRunAcceptance = 'accepted' | 'pending' | 'unknown';

export type ChannelPublicationStatus = 'pending' | 'published';

/** Approval of a member that executes on someone's personal device (or a private shared one). */
export type ChannelMemberGrantStatus = 'approved' | 'pending' | 'rejected' | 'revoked';

export type ChannelMemberGrantRevokeReason = 'device_owner_left' | 'revoked_by_owner';

export interface ChannelContextMessage {
  /** `id` is the author's member id. */
  author: { id: string; name: string; type: ChannelMemberActorType };
  content: string;
  /** Stable references; URLs and document contents are resolved at execution time. */
  fileIds?: string[];
  id: string;
  sequence: number;
  threadId: string | null;
}

export interface ChannelInputManifest {
  /** Immutable at claim time; later public messages belong to the next run. */
  cutoffSequence: number;
  /** Snapshot for a new session; otherwise only messages the session has not accepted yet. */
  messages: ChannelContextMessage[];
  /** The member that triggered this run; its user is the execution identity. */
  requesterMemberId: string;
  requestMessageId: string;
  /** Fixed at claim time. */
  self: { memberId: string; name: string };
  sessionGeneration: number;
  /** Serialized to the CLI as contextMode: reconstructed -> snapshot, incremental -> delta. */
  source: 'incremental' | 'reconstructed';
  threadId: string | null;
  /** Main-channel prefix visible to this branch; null for main. */
  threadRootSequence: number | null;
}

/** Flat audit payload: routing decisions, claims, fences, isolation reasons. */
export type ChannelAuditDetails = Record<string, boolean | number | string | string[] | null>;
