import { renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import useSWR, { SWRConfig, unstable_serialize } from 'swr';
import { describe, expect, it } from 'vitest';

import { localFileKeys, portalKeys } from './keys';
import { sanitizeForPersistence } from './persistSanitizers';

/** Mount `useSWR` over a cache that holds exactly what a reload hydrates. */
const mountFromPersisted = (key: readonly unknown[], live: unknown) => {
  const serialized = unstable_serialize(key);
  const cache = new Map([[serialized, sanitizeForPersistence(serialized, live)]]);
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(SWRConfig, { value: { provider: () => cache as any } }, children);

  return renderHook(() => useSWR(key, () => new Promise<never>(() => {})), { wrapper }).result;
};

/**
 * Regression: a persisted row of bare `{ data }` still reported `isLoading` on
 * the first mount (SWR reads a missing `isLoading` as loading), so the portal
 * painted its full-panel spinner over the cached document.
 */
describe('sanitizeForPersistence — first paint from a hydrated row', () => {
  it('renders the cached document header without a loading state', () => {
    const doc = { content: '# cached', id: 'doc-1', title: 'Cached' };
    const result = mountFromPersisted(portalKeys.documentHeader('doc-1'), {
      data: doc,
      isLoading: false,
      isValidating: true,
    });

    expect(result.current.data).toEqual(doc);
    expect(result.current.isLoading).toBe(false);
  });

  it('renders the cached text preview without a loading state', () => {
    const result = mountFromPersisted(
      localFileKeys.preview({ filePath: '/repo/a.md', workingDirectory: '/repo' }),
      { data: { content: 'cached', contentType: 'text/markdown', type: 'text' } },
    );

    expect(result.current.data).toEqual({
      content: 'cached',
      contentType: 'text/markdown',
      type: 'text',
    });
    expect(result.current.isLoading).toBe(false);
  });
});
