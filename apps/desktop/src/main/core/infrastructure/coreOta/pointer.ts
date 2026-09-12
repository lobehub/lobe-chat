import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { isSafeVersion } from './store';

export interface CorePointer {
  abi: string;
  blacklist: string[];
  current: string | null;
  previous: string | null;
  staged: string | null;
}

const versionOrNull = (value: unknown): string | null =>
  typeof value === 'string' && isSafeVersion(value) ? value : null;

export const emptyPointer = (abi: string): CorePointer => ({
  abi,
  blacklist: [],
  current: null,
  previous: null,
  staged: null,
});

export const readPointer = (otaRoot: string, abi: string): CorePointer => {
  try {
    const raw = JSON.parse(readFileSync(path.join(otaRoot, 'pointer.json'), 'utf8'));
    if (raw?.abi === abi) {
      return {
        abi,
        blacklist: Array.isArray(raw.blacklist) ? raw.blacklist.filter(versionOrNull) : [],
        current: versionOrNull(raw.current),
        previous: versionOrNull(raw.previous),
        staged: versionOrNull(raw.staged),
      };
    }
  } catch {}
  return emptyPointer(abi);
};

export const writePointer = (otaRoot: string, pointer: CorePointer): void => {
  mkdirSync(otaRoot, { mode: 0o700, recursive: true });
  const target = path.join(otaRoot, 'pointer.json');
  writeFileSync(`${target}.tmp`, JSON.stringify(pointer, null, 2));
  renameSync(`${target}.tmp`, target);
};
