import {
  captureStyles,
  diffStyleSnapshots,
  type StyleSnapshotDiff,
  type StyleSnapshotEntry,
} from './snapshot';

const STORAGE_PREFIX = 'lobe-style-snapshot:';

interface StoredSnapshot {
  entries: StyleSnapshotEntry[];
  selector: string;
}

export interface StyleSnapshotApi {
  capture: (name: string, selector?: string) => number;
  clear: () => void;
  compare: (name: string, selector?: string) => StyleSnapshotDiff[];
}

declare global {
  interface Window {
    __lobeStyleSnapshot?: StyleSnapshotApi;
  }
}

const findRoot = (selector: string) => {
  const root = document.querySelector(selector);
  if (!root) throw new Error(`[styleSnapshot] no element matches ${selector}`);
  return root;
};

export const createStyleSnapshotApi = (storage: Storage = localStorage): StyleSnapshotApi => ({
  capture: (name, selector = 'body') => {
    const entries = captureStyles(findRoot(selector));
    storage.setItem(
      STORAGE_PREFIX + name,
      JSON.stringify({ entries, selector } satisfies StoredSnapshot),
    );
    return entries.length;
  },
  clear: () => {
    const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index));
    for (const key of keys) {
      if (key?.startsWith(STORAGE_PREFIX)) storage.removeItem(key);
    }
  },
  compare: (name, selector) => {
    const raw = storage.getItem(STORAGE_PREFIX + name);
    if (!raw) throw new Error(`[styleSnapshot] no snapshot named ${name}`);
    const saved = JSON.parse(raw) as StoredSnapshot;
    return diffStyleSnapshots(saved.entries, captureStyles(findRoot(selector ?? saved.selector)));
  },
});

export const installStyleSnapshot = () => {
  window.__lobeStyleSnapshot = createStyleSnapshotApi();
};
