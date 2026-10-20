import type { CanvasProjectFile } from '../validate/types';
import { normalizeCanvasPath } from './path';

export interface CanvasFileWrite {
  content?: string;
  encoding?: 'base64' | 'utf8';
  fileRef?: string;
  path: string;
}

export interface CanvasFileRefWrite {
  fileRef: string;
  path: string;
}

export interface CanvasFileEdit {
  newText: string;
  oldText: string;
  path: string;
}

export interface CanvasChangeSet {
  deletes?: string[];
  edits?: CanvasFileEdit[];
  writes?: CanvasFileWrite[];
}

export type CanvasChangeResult =
  { error: string; ok: false } | { files: CanvasProjectFile[]; ok: true };

const decodeBase64 = (value: string) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

// Strict tool-calling models fill every schema property, so a plain write arrives with fileRef "".
export const isCanvasFileRefWrite = (write: CanvasFileWrite): write is CanvasFileRefWrite =>
  typeof write.fileRef === 'string' && write.fileRef.length > 0;

export const collectCanvasFileRefs = (changes: CanvasChangeSet): CanvasFileRefWrite[] =>
  (changes.writes ?? []).filter(isCanvasFileRefWrite).map((write) => ({
    fileRef: write.fileRef,
    path: normalizeCanvasPath(write.path) ?? write.path,
  }));

const countOccurrences = (text: string, search: string) => {
  let count = 0;
  for (let index = text.indexOf(search); index !== -1; index = text.indexOf(search, index + 1)) {
    count += 1;
  }
  return count;
};

export const applyCanvasChanges = (
  base: ReadonlyMap<string, CanvasProjectFile>,
  changes: CanvasChangeSet,
  resolvedFileRefs: ReadonlyMap<string, string | Uint8Array> = new Map(),
): CanvasChangeResult => {
  const files = new Map(base);

  for (const write of changes.writes ?? []) {
    const path = normalizeCanvasPath(write.path) ?? write.path;
    if (isCanvasFileRefWrite(write)) {
      const content = resolvedFileRefs.get(write.fileRef);
      if (content === undefined) {
        return {
          error: `"${path}": fileRef "${write.fileRef}" could not be resolved.`,
          ok: false,
        };
      }
      files.set(path, { content, path });
      continue;
    }

    if (write.content === undefined) {
      return { error: `"${path}": provide content or fileRef.`, ok: false };
    }
    let content: string | Uint8Array = write.content;
    if (write.encoding === 'base64') {
      try {
        content = decodeBase64(write.content);
      } catch {
        return { error: `"${write.path}" is not valid base64.`, ok: false };
      }
    }
    files.set(path, { content, path });
  }

  for (const edit of changes.edits ?? []) {
    const path = normalizeCanvasPath(edit.path) ?? edit.path;
    const file = files.get(path);
    if (!file) return { error: `Cannot edit "${edit.path}": the file does not exist.`, ok: false };
    if (typeof file.content !== 'string') {
      return {
        error: `Cannot edit "${edit.path}": it is a binary file. Write it instead.`,
        ok: false,
      };
    }

    const occurrences = countOccurrences(file.content, edit.oldText);
    if (occurrences !== 1) {
      return {
        error: `Cannot edit "${edit.path}": oldText appears ${occurrences} times; it must appear exactly once. Include more surrounding text.`,
        ok: false,
      };
    }
    files.set(path, { content: file.content.replace(edit.oldText, () => edit.newText), path });
  }

  for (const target of changes.deletes ?? []) {
    const path = normalizeCanvasPath(target) ?? target;
    if (!files.delete(path)) {
      return { error: `Cannot delete "${target}": the file does not exist.`, ok: false };
    }
  }

  return { files: [...files.values()], ok: true };
};
