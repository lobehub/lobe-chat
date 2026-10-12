/**
 * Per-key reshaping applied right before an SWR cache entry is written to a
 * persistence tier (see `CACHE_TIERS`). The in-memory entry is untouched — only
 * what survives a reload is narrowed. Returning `undefined` skips persisting.
 */
type PersistSanitizer = (value: unknown) => unknown;

/**
 * Largest text preview (UTF-16 code units) kept across reloads. Every IndexedDB
 * row is loaded into memory at boot, so a huge log or generated file stays
 * memory-only and simply refetches.
 */
export const MAX_PERSISTED_PREVIEW_CHARS = 256 * 1024;

/** Largest serialized portal document header (UTF-16 code units) kept across reloads. */
export const MAX_PERSISTED_DOCUMENT_HEADER_CHARS = 512 * 1024;

const dataOf = (value: unknown): unknown => (value as { data?: unknown } | null | undefined)?.data;

/**
 * The persisted SWR state for a cached value. Keep the request flags explicit:
 * SWR treats a missing `isLoading` as "loading" on the first mount even when
 * `data` is present, so a bare `{ data }` row would still paint the spinner.
 */
export const toPersistedState = (data: unknown) => ({
  data,
  isLoading: false,
  isValidating: false,
});

/**
 * `localFile:preview` keeps text previews only: images / documents hold Blobs
 * and video / binary placeholders are cheap to recompute. `resourceBaseUrl` is
 * dropped because it embeds a short-lived desktop preview token; the background
 * revalidation brings a fresh one.
 */
const sanitizeLocalFilePreview: PersistSanitizer = (value) => {
  const data = dataOf(value) as
    { content?: unknown; contentType?: unknown; type?: unknown } | null | undefined;
  if (data?.type !== 'text' || typeof data.content !== 'string') return undefined;
  if (data.content.length > MAX_PERSISTED_PREVIEW_CHARS) return undefined;

  // Keep only the data — never a live request state or `error`.
  return toPersistedState({ content: data.content, contentType: data.contentType, type: 'text' });
};

const sanitizeDocumentHeader: PersistSanitizer = (value) => {
  const data = dataOf(value);
  if (!data || typeof data !== 'object') return undefined;
  try {
    if (JSON.stringify(data).length > MAX_PERSISTED_DOCUMENT_HEADER_CHARS) return undefined;
  } catch {
    return undefined;
  }

  return toPersistedState(data);
};

const SANITIZERS: [pattern: string, sanitize: PersistSanitizer][] = [
  ['localFile:preview', sanitizeLocalFilePreview],
  ['portal:documentHeader', sanitizeDocumentHeader],
];

/** Reshape an SWR cache entry for persistence; identity for keys with no sanitizer. */
export const sanitizeForPersistence = (key: string, value: unknown): unknown => {
  for (const [pattern, sanitize] of SANITIZERS) {
    if (key.includes(pattern)) return sanitize(value);
  }
  return value;
};
