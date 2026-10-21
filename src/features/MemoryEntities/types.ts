/**
 * Entity pages: every context is a page for one thing in the user's life, and activities are
 * the timeline entries that link pages together. People live in the identity layer but render
 * with the same page, so `person` is a kind here too.
 */
export type ContextKind = 'project' | 'event' | 'thing' | 'place' | 'org';
export type EntityKind = ContextKind | 'person';

export type EntityStatus = 'active' | 'dormant' | 'closed';

export interface EntityRef {
  id: string;
  kind: EntityKind;
}

export interface MemoryEntity {
  aliases: string[];
  /** Short profile. For a person this is the identity description. */
  description: string;
  firstMentionedAt: string;
  id: string;
  kind: EntityKind;
  /** Overwritten as the user's situation changes; older wording stays in the timeline. */
  now: string;
  nowEditedBy: 'conversation' | 'user';
  nowUpdatedAt: string;
  /** Person only: how they relate to the user. */
  relationship?: string;
  status: EntityStatus;
  title: string;
}

export interface MemoryActivity {
  id: string;
  /** Every page this entry shows up on. One entry, many pages: that is the backlink. */
  links: EntityRef[];
  narrative: string;
  /** Conversation the entry was learned from. */
  source?: { id: string; title: string };
  /** When it happened (or will happen). */
  startsAt: string;
  status: 'done' | 'planned';
}

export interface MergeSuggestion {
  /** The page folded into it. */
  fromId: string;
  /** The page that keeps its name. */
  intoId: string;
  reason: string;
}

export type DemoState = 'ready' | 'empty' | 'loading' | 'error';
