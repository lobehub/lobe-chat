import { describe, expect, it } from 'vitest';

import { isPageDocumentLoaded } from './pageDocumentLoaded';

describe('isPageDocumentLoaded', () => {
  const state = { documentDetailMap: { loaded: { document: { fileType: 'custom/html' } } } } as any;

  it('holds the copilot until the open page is known', () => {
    expect(isPageDocumentLoaded(state, 'loaded')).toBe(true);
    // The page kind decides which tools the copilot gets; before it loads an
    // HTML page would be sent as a rich-text one.
    expect(isPageDocumentLoaded(state, 'still-loading')).toBe(false);
  });

  it('does not hold a copilot with no page', () => {
    expect(isPageDocumentLoaded(state, undefined)).toBe(true);
  });
});
