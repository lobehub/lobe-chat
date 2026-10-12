/**
 * Persistence codecs for the Files tab (`localFile:projectIndex` /
 * `localFile:gitWorkingTreeFiles`).
 *
 * A project index is a flat list of every file in a repo, and each entry
 * repeats what the root and its own relative path already say (`path`,
 * `name`). Stored verbatim a large monorepo is megabytes per directory, so
 * these codecs store the entries as compact tuples, keep only what the first
 * paint can show when a tree is past the cap, and refuse to persist anything
 * that would still be too large — the network refresh that follows hydration
 * is what makes the tree whole again.
 */
import type {
  GitWorkingTreeFiles,
  ProjectFileIndexEntry,
  ProjectFileIndexResult,
} from '@lobechat/electron-client-ipc';

import type { PersistCodec } from '../localStorageProvider';

/**
 * Entries beyond this many are not persisted. The default first paint expands
 * the project root only, so the shallowest entries are the ones worth keeping.
 */
export const PROJECT_INDEX_PERSIST_MAX_ENTRIES = 20_000;

/** A dirty-file overlay this large is not worth a stale first paint. */
export const GIT_WORKING_TREE_PERSIST_MAX_PATHS = 5000;

const ENCODED_PROJECT_INDEX = 'projectIndex@1';

const FLAG_DIRECTORY = 1;
const FLAG_GIT_IGNORED = 2;
const FLAG_COLLAPSED = 4;

/**
 * `[relativePath, flags, path?, name?]` — `path` and `name` are only present
 * when they differ from what the root and relative path derive.
 */
type EncodedEntry = [string, number] | [string, number, string | null, string?];

interface EncodedProjectIndex {
  __codec: typeof ENCODED_PROJECT_INDEX;
  entries: EncodedEntry[];
  indexedAt: string;
  root: string;
  source: ProjectFileIndexResult['source'];
  truncated?: boolean;
}

const trimTrailingSlash = (value: string) => (value.endsWith('/') ? value.slice(0, -1) : value);

const deriveName = (relativePath: string) => {
  const cleaned = trimTrailingSlash(relativePath);
  return cleaned.slice(cleaned.lastIndexOf('/') + 1);
};

/** The absolute path a host would produce for `relativePath` under `root`. */
const derivePath = (root: string, relativePath: string) => {
  const separator = root.includes('\\') && !root.includes('/') ? '\\' : '/';
  const relative = trimTrailingSlash(relativePath).split('/').join(separator);
  if (!root) return relative;
  return root.endsWith(separator) ? `${root}${relative}` : `${root}${separator}${relative}`;
};

const depthOf = (relativePath: string) => trimTrailingSlash(relativePath).split('/').length;

const encodeEntry = (root: string, entry: ProjectFileIndexEntry): EncodedEntry => {
  const flags =
    (entry.isDirectory ? FLAG_DIRECTORY : 0) |
    (entry.gitIgnored ? FLAG_GIT_IGNORED : 0) |
    (entry.collapsed ? FLAG_COLLAPSED : 0);
  const path = entry.path === derivePath(root, entry.relativePath) ? null : entry.path;
  const name = entry.name === deriveName(entry.relativePath) ? undefined : entry.name;

  if (name !== undefined) return [entry.relativePath, flags, path, name];
  if (path !== null) return [entry.relativePath, flags, path];
  return [entry.relativePath, flags];
};

const decodeEntry = (root: string, encoded: EncodedEntry): ProjectFileIndexEntry => {
  const [relativePath, flags, path, name] = encoded;
  return {
    ...(flags & FLAG_COLLAPSED ? { collapsed: true } : {}),
    ...(flags & FLAG_GIT_IGNORED ? { gitIgnored: true } : {}),
    isDirectory: Boolean(flags & FLAG_DIRECTORY),
    name: name ?? deriveName(relativePath),
    path: path ?? derivePath(root, relativePath),
    relativePath,
  };
};

/**
 * Keep the shallowest `max` entries, in their original order. A tree cut by
 * depth still renders every visible top-level row correctly; one cut by list
 * position would drop whole sibling folders from the root.
 */
const keepShallowest = (entries: ProjectFileIndexEntry[], max: number) => {
  if (entries.length <= max) return entries;
  const ranked = entries
    .map((entry, index) => ({ depth: depthOf(entry.relativePath), index }))
    .sort((a, b) => a.depth - b.depth || a.index - b.index)
    .slice(0, max)
    .map(({ index }) => index)
    .sort((a, b) => a - b);
  return ranked.map((index) => entries[index]);
};

export const encodeProjectIndex = (
  data: ProjectFileIndexResult,
  maxEntries = PROJECT_INDEX_PERSIST_MAX_ENTRIES,
): EncodedProjectIndex => ({
  __codec: ENCODED_PROJECT_INDEX,
  entries: keepShallowest(data.entries, maxEntries).map((entry) => encodeEntry(data.root, entry)),
  indexedAt: data.indexedAt,
  root: data.root,
  source: data.source,
  ...(data.truncated ? { truncated: true } : {}),
});

export const decodeProjectIndex = (encoded: EncodedProjectIndex): ProjectFileIndexResult => ({
  entries: encoded.entries.map((entry) => decodeEntry(encoded.root, entry)),
  indexedAt: encoded.indexedAt,
  root: encoded.root,
  source: encoded.source,
  ...(encoded.truncated ? { truncated: true } : {}),
});

const isEncodedProjectIndex = (value: unknown): value is EncodedProjectIndex =>
  !!value &&
  typeof value === 'object' &&
  (value as EncodedProjectIndex).__codec === ENCODED_PROJECT_INDEX &&
  Array.isArray((value as EncodedProjectIndex).entries);

const isProjectIndex = (value: unknown): value is ProjectFileIndexResult =>
  !!value &&
  typeof value === 'object' &&
  Array.isArray((value as ProjectFileIndexResult).entries) &&
  typeof (value as ProjectFileIndexResult).root === 'string';

const isGitWorkingTreeFiles = (value: unknown): value is GitWorkingTreeFiles =>
  !!value &&
  typeof value === 'object' &&
  Array.isArray((value as GitWorkingTreeFiles).added) &&
  Array.isArray((value as GitWorkingTreeFiles).modified) &&
  Array.isArray((value as GitWorkingTreeFiles).deleted);

/** SWR keeps `{ data, error, isLoading, isValidating }` per key. */
interface CacheState {
  data?: unknown;
}

/**
 * Only settled data is worth a row: an error or an in-flight flag hydrated
 * into a fresh session would read as the state of a request that never ran.
 */
const settled = (state: unknown): CacheState | undefined => {
  if (!state || typeof state !== 'object') return undefined;
  const { data } = state as CacheState;
  return data === undefined ? undefined : { data };
};

export const projectIndexCodec: PersistCodec = {
  decode: (stored) => {
    const state = settled(stored);
    if (!state || !isEncodedProjectIndex(state.data)) return undefined;
    return { data: decodeProjectIndex(state.data) };
  },
  encode: (value) => {
    const state = settled(value);
    if (!state || !isProjectIndex(state.data)) return undefined;
    return { data: encodeProjectIndex(state.data) };
  },
  id: ENCODED_PROJECT_INDEX,
  pattern: 'localFile:projectIndex',
};

export const gitWorkingTreeFilesCodec: PersistCodec = {
  decode: (stored) => {
    const state = settled(stored);
    return state && isGitWorkingTreeFiles(state.data) ? state : undefined;
  },
  encode: (value) => {
    const state = settled(value);
    if (!state || !isGitWorkingTreeFiles(state.data)) return undefined;
    const { added, deleted, modified } = state.data;
    if (added.length + deleted.length + modified.length > GIT_WORKING_TREE_PERSIST_MAX_PATHS)
      return undefined;
    return { data: { added, deleted, modified } };
  },
  id: 'gitWorkingTreeFiles@1',
  pattern: 'localFile:gitWorkingTreeFiles',
};
