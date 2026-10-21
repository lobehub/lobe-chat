// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resolvePageDocumentType } from './pageDocument';

const findById = vi.hoisted(() => vi.fn());

vi.mock('@/database/models/document', () => ({
  DocumentModel: vi.fn().mockImplementation(function () {
    return { findById };
  }),
}));

const deps = { db: {} as any, userId: 'user-1' };

describe('resolvePageDocumentType', () => {
  beforeEach(() => findById.mockReset());

  it('reads the open page kind in page scope', async () => {
    findById.mockResolvedValueOnce({ fileType: 'custom/html' });
    await expect(
      resolvePageDocumentType(deps, { documentId: 'doc-1', scope: 'page' } as any),
    ).resolves.toBe('html');

    findById.mockResolvedValueOnce({ fileType: 'custom/document' });
    await expect(
      resolvePageDocumentType(deps, { documentId: 'doc-1', scope: 'page' } as any),
    ).resolves.toBe('rich-text');
  });

  it('stays unknown outside page scope or when the page cannot be read', async () => {
    await expect(
      resolvePageDocumentType(deps, { documentId: 'doc-1', scope: 'main' } as any),
    ).resolves.toBeUndefined();
    expect(findById).not.toHaveBeenCalled();

    findById.mockRejectedValueOnce(new Error('db down'));
    await expect(
      resolvePageDocumentType(deps, { documentId: 'doc-1', scope: 'page' } as any),
    ).resolves.toBeUndefined();
  });
});
