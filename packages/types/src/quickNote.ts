/**
 * Execution kinds supported by the Quick Note processing pipeline.
 *
 * `discovery` performs lightweight annotation, `signal_enrichment` records
 * context discovered by another system activity, and `dive` performs an
 * explicit user-requested investigation.
 */
export const QUICK_NOTE_RUN_KINDS = ['discovery', 'signal_enrichment', 'dive'] as const;

/** A processing mode recorded by an immutable Quick Note Run. */
export type QuickNoteRunKind = (typeof QUICK_NOTE_RUN_KINDS)[number];

/** Lifecycle values for a Quick Note Run. */
export const QUICK_NOTE_RUN_STATUSES = [
  'pending',
  'running',
  'completed',
  'failed',
  'canceled',
  'superseded',
] as const;

/** The persisted lifecycle state of a Quick Note Run. */
export type QuickNoteRunStatus = (typeof QUICK_NOTE_RUN_STATUSES)[number];

/**
 * Well-known roles for Documents linked to a Quick Note.
 *
 * This is intentionally not a closed union at the database boundary: future
 * agents may add new resource roles without a migration.
 */
export const QUICK_NOTE_RESOURCE_ROLES = ['annotation', 'context'] as const;

/** A well-known semantic role for a Quick Note Resource. */
export type QuickNoteResourceRole = (typeof QUICK_NOTE_RESOURCE_ROLES)[number];
