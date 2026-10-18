import isEqual from 'fast-deep-equal';
import { describe, expect, it } from 'vitest';

import type { QuickNoteItem } from '@/services/quickNote';

import { initialState, type QuickNoteState } from './initialState';
import { quickNoteSelectors } from './selectors';

const note: QuickNoteItem = {
  annotation: { content: 'Existing analysis', divedAt: 1000 },
  collection: 'Research',
  content: 'Original note',
  createdAt: 1000,
  id: 'note-1',
  run: { kind: 'analyze', status: 'completed' },
  tags: ['Voice'],
  updatedAt: 1000,
};

const stateWith = (notes: QuickNoteItem[]): QuickNoteState => ({ ...initialState, notes });

const base = stateWith([note]);
const contentEdited = stateWith([{ ...note, content: 'Edited note' }]);
const polledClone = stateWith(structuredClone([note]));
const reannotated = stateWith([
  { ...note, annotation: { content: 'New analysis', divedAt: 2000 }, tags: ['Audio'] },
]);

// ROOT CAUSE:
// The AI panel selected the entire note; bucket selectors returned new objects.
// Updating content or cloning a polling response therefore committed both regions.
// Select only displayed fields and compare them with `fast-deep-equal` (as the components do).
/** @example Editing text or polling identical data leaves the AI panel and filter views equal. */
describe('quickNoteSelectors render isolation', () => {
  const regions = {
    aiPanelViewById: quickNoteSelectors.aiPanelViewById(note.id),
    collections: quickNoteSelectors.collections,
    runById: quickNoteSelectors.runById(note.id),
    tags: quickNoteSelectors.tags,
  };

  it.each(Object.entries(regions))('%s ignores content edits and cloned polls', (_, select) => {
    /** @example Content edits do not change the selected view. */
    expect(isEqual(select(base), select(contentEdited))).toBe(true);
    /** @example A new response identity alone does not change the selected view. */
    expect(isEqual(select(base), select(polledClone))).toBe(true);
  });

  it('propagates real annotation and tag changes', () => {
    const view = quickNoteSelectors.aiPanelViewById(note.id)(reannotated);

    /** @example Real annotation changes still reach the AI panel. */
    expect(view).toMatchObject({ annotationContent: 'New analysis', tags: ['Audio'] });
    expect(isEqual(quickNoteSelectors.aiPanelViewById(note.id)(base), view)).toBe(false);
    /** @example Real tag changes still update the filter. */
    expect(quickNoteSelectors.tags(reannotated)).toEqual([{ count: 1, name: 'Audio' }]);
    expect(isEqual(quickNoteSelectors.tags(base), quickNoteSelectors.tags(reannotated))).toBe(
      false,
    );
  });

  it('reports an empty view for a missing note', () => {
    /** @example A missing note renders nothing in the AI panel. */
    expect(quickNoteSelectors.aiPanelViewById('missing')(base)).toEqual({
      annotationContent: undefined,
      dived: false,
      exists: false,
      hasContent: false,
      tags: [],
    });
  });
});
