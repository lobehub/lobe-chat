import { describe, expect, it } from 'vitest';

import { parseQuickNoteDiscoveryOutput, renderQuickNoteSourceText } from '.';

/** @example Quick Note agent boundaries normalize rich-text input and structured output. */
describe('QuickNoteProcessingService helpers', () => {
  /** @example Lexical text nodes become a compact source string for an immutable Run prompt. */
  it('renders nested editor text without leaking structural JSON', () => {
    const rendered = renderQuickNoteSourceText({
      root: { children: [{ children: [{ text: 'Second' }], text: 'First' }] },
    });

    /** @example Human-readable text is preserved in traversal order. */
    expect(rendered).toBe('First\nSecond');
  });

  /** @example Markdown-backed Document revisions retain their source text. */
  it('renders a Markdown editor projection', () => {
    /** @example The fallback format becomes the exact prompt source. */
    expect(renderQuickNoteSourceText({ markdown: 'Remember this' })).toBe('Remember this');
  });

  /** @example Discovery accepts a fenced JSON result produced by a chat model. */
  it('parses and bounds Discovery output', () => {
    const parsed = parseQuickNoteDiscoveryOutput(
      '```json\n{"annotation":"Useful","tags":["one","two","three","four","five","six"],"relatedDocumentIds":["docs_1"]}\n```',
    );

    /** @example Only the five lightweight tags allowed by the agent contract survive. */
    expect(parsed).toEqual({
      annotation: 'Useful',
      relatedDocumentIds: ['docs_1'],
      tags: ['one', 'two', 'three', 'four', 'five'],
    });
  });
});
