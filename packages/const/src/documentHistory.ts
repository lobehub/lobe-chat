/** Fixed clock window used to coalesce continuous editor autosaves into one history revision. */
export const DOCUMENT_HISTORY_AUTOSAVE_WINDOW_MS = 10 * 60 * 1000;

/** Maximum number of retained autosave revisions for one Document. */
export const DOCUMENT_HISTORY_AUTOSAVE_SOURCE_LIMIT = 20;
