import { defineReplica } from '@/libs/replica';
import type { LocalFilePreview } from '@/services/projectFile';

/** One file the local-file portal previews: where it lives and how it was opened. */
export interface LocalFilePreviewTarget {
  /** A user-picked file outside the approved workspace roots. */
  allowExternalFile?: boolean;
  /** Remote device the file lives on; absent = this machine. */
  deviceId?: string;
  filePath: string;
  /** Read live from this topic's cloud sandbox instead of a filesystem. */
  sandboxTopicId?: string;
  workingDirectory: string;
}

/**
 * Largest text preview (UTF-16 code units) kept across reloads. A huge log or
 * generated file stays memory-only and simply refetches.
 */
export const MAX_PERSISTED_PREVIEW_CHARS = 256 * 1024;

/** How many file previews survive a reload (`persist.maxEntries`). */
export const MAX_PERSISTED_PREVIEWS = 30;

/**
 * Entry key of one preview: source (sandbox / device / this machine) +
 * working directory + path, plus the external-file flag that changes what the
 * read is allowed to reach. A string, so two mounts of the same tab share one
 * entry and one sync query.
 */
export const localFilePreviewKey = ({
  allowExternalFile,
  deviceId,
  filePath,
  sandboxTopicId,
  workingDirectory,
}: LocalFilePreviewTarget): string =>
  JSON.stringify([
    sandboxTopicId ? `sandbox:${sandboxTopicId}` : (deviceId ?? 'local'),
    workingDirectory,
    filePath,
    allowExternalFile ? 'external' : 'workspace',
  ]);

/** The target a {@link localFilePreviewKey} was built from (fetcher side). */
export const localFilePreviewTargetFromKey = (key: string): LocalFilePreviewTarget => {
  const [source, workingDirectory, filePath, access] = JSON.parse(key) as [
    string,
    string,
    string,
    string,
  ];
  return {
    allowExternalFile: access === 'external' || undefined,
    deviceId: source === 'local' || source.startsWith('sandbox:') ? undefined : source,
    filePath,
    sandboxTopicId: source.startsWith('sandbox:') ? source.slice('sandbox:'.length) : undefined,
    workingDirectory,
  };
};

/**
 * What of a preview survives a reload: text previews only, up to
 * {@link MAX_PERSISTED_PREVIEW_CHARS}. Images / documents hold Blobs and video /
 * binary placeholders are cheap to recompute, so they stay memory-only.
 * `resourceBaseUrl` embeds a short-lived desktop preview token, so it is never
 * stored; the background refresh brings a fresh one.
 *
 * `null` = do not persist, and drop a row stored earlier (a file that grew past
 * the cap or turned binary must not come back on the next boot).
 */
export const toPersistedLocalFilePreview = (preview: LocalFilePreview): LocalFilePreview | null =>
  preview.type === 'text' && preview.content.length <= MAX_PERSISTED_PREVIEW_CHARS
    ? { content: preview.content, contentType: preview.contentType, type: 'text' }
    : null;

/**
 * File previews of the local-file portal, one entry per opened file. Persisted
 * to IndexedDB under the user / workspace scope, so a reload paints the last
 * text the portal showed while the device (or sandbox) confirms it.
 */
export const localFilePreviewResource = defineReplica<string, LocalFilePreview>({
  key: (key) => key,
  name: 'localFilePreview',
  persist: { maxEntries: MAX_PERSISTED_PREVIEWS },
  storage: 'indexedDB',
  version: 1,
});
