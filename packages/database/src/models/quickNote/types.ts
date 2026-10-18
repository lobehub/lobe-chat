import type {
  QuickNoteAnalyzeTrigger,
  QuickNoteProposalKind,
  QuickNoteResourceReference,
  QuickNoteResourceRole,
  QuickNoteRunKind,
} from '@lobechat/types';

export interface QuickNoteEditorData extends Record<string, unknown> {}

/** Input used to atomically create a Quick Note and its backing containers. */
export interface CreateQuickNoteParams {
  /** When this capture becomes eligible for Automatic Analyze. */
  analyzeDueAt?: Date | null;
  /** Optional collection label chosen by the user. */
  collection?: string | null;
  /** Plain-text projection of the rich-text editor content. */
  content?: string;
  /** Rich-text source stored in the backing Document. */
  editorData?: QuickNoteEditorData;
  /** Optional client-generated Quick Note identifier. */
  id?: string;
  /** Optional location hint attached directly to the capture. */
  location?: string | null;
  /** Lightweight labels attached directly to the capture. */
  tags?: string[];
}

/** Mutable source fields persisted by the editor autosave path. */
export interface UpdateQuickNoteContentParams {
  /** When Automatic Analyze becomes eligible for dispatch. */
  analyzeDueAt?: Date | null;
  /** Plain-text projection of the rich-text editor content. */
  content: string;
  /** Rich-text source stored in the backing Document. */
  editorData: QuickNoteEditorData;
}

/** Input used to claim an immutable processing Run. */
export interface ClaimQuickNoteRunParams {
  /** Processing mode to dispatch for the pinned source revision. */
  kind: QuickNoteRunKind;
  /** Provenance for Analyze; omitted for Dive and internal enrichment. */
  trigger?: QuickNoteAnalyzeTrigger;
}

/** Accepted lightweight interpretation produced by a Quick Note Run. */
export interface AcceptQuickNoteAnnotationParams {
  /** Concise Markdown projection shown by the existing Annotation panel. */
  content: string;
  /** Rich-text representation of the accepted Annotation revision. */
  editorData?: QuickNoteEditorData;
  /** Optional downstream suggestions persisted without executing them. */
  proposals?: QuickNoteProposalDraft[];
  /** Lightweight labels merged onto the Quick Note. */
  tags?: string[];
}

/** Editable downstream suggestion returned by Quick Note interpretation. */
export interface QuickNoteProposalDraft {
  /** Markdown projection stored in the Proposal's backing Document. */
  content: string;
  /** Rich-text representation of the Proposal body. */
  editorData?: QuickNoteEditorData;
  /** Product object the Proposal could create after explicit acceptance. */
  kind: QuickNoteProposalKind;
}

/** Input used to append user context to a Quick Note. */
export interface CreateQuickNoteCommentParams {
  /** Plain-text projection shown in the comment stream. */
  content: string;
  /** Optional rich-text source retained with each immutable revision. */
  editorData?: QuickNoteEditorData;
}

/** Input used to edit a Quick Note Comment without losing its earlier text. */
export interface UpdateQuickNoteCommentParams extends CreateQuickNoteCommentParams {}

/** Input used to edit a Proposal's Document-backed body. */
export interface UpdateQuickNoteProposalParams {
  /** Markdown projection stored in the backing Document. */
  content: string;
  /** Rich-text representation stored in the new Document History. */
  editorData: QuickNoteEditorData;
}

/** Input used to persist a typed resource judged relevant to a Quick Note Run. */
export interface LinkQuickNoteResourceParams extends QuickNoteResourceReference {
  /** Meaning of the resource for the Quick Note source revision. */
  role?: QuickNoteResourceRole;
}
