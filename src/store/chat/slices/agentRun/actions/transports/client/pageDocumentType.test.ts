import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveClientPageDocumentType } from './pageDocumentType';

const mocks = vi.hoisted(() => ({ currentDocId: undefined as string | undefined, detail: {} }));

vi.mock('@/store/document', () => ({
  getDocumentStoreState: () => ({ documentDetailMap: mocks.detail }),
}));
vi.mock('@/store/tool/slices/builtin/executors/pageAgentRuntime', () => ({
  pageAgentRuntime: { getCurrentDocId: () => mocks.currentDocId },
}));

describe('resolveClientPageDocumentType', () => {
  beforeEach(() => {
    mocks.currentDocId = undefined;
    mocks.detail = {
      'html-page': { document: { fileType: 'custom/html' } },
      'text-page': { document: { fileType: 'custom/document' } },
    };
  });

  it('tells HTML pages from rich-text pages in page scope', () => {
    expect(resolveClientPageDocumentType('page', 'html-page')).toBe('html');
    expect(resolveClientPageDocumentType('page', 'text-page')).toBe('rich-text');
  });

  it('falls back to the open editor document', () => {
    mocks.currentDocId = 'html-page';
    expect(resolveClientPageDocumentType('page', undefined)).toBe('html');
  });

  it('is unknown outside page scope or without a page', () => {
    expect(resolveClientPageDocumentType('main', 'html-page')).toBeUndefined();
    expect(resolveClientPageDocumentType('page', undefined)).toBeUndefined();
  });
});
