import { Store } from './action';

export const selectors = {
  currentDocId: (s: Store) => s.currentDocId,
  editor: (s: Store) => s.editor,
  saveStatus: (s: Store) => s.saveStatus,
  wordCount: (s: Store) => s.wordCount,
};
