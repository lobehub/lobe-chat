import { describe, expect, it } from 'vitest';

import { isDocumentUnavailableError } from './isDocumentUnavailableError';

const trpcError = (code: string) => Object.assign(new Error(code), { data: { code } });

describe('isDocumentUnavailableError', () => {
  it('matches a page this member may not open or that no longer exists', () => {
    expect(isDocumentUnavailableError(trpcError('FORBIDDEN'))).toBe(true);
    expect(isDocumentUnavailableError(trpcError('NOT_FOUND'))).toBe(true);
  });

  it('leaves transient failures to their own retryable error state', () => {
    expect(isDocumentUnavailableError(trpcError('INTERNAL_SERVER_ERROR'))).toBe(false);
    expect(isDocumentUnavailableError(new Error('network'))).toBe(false);
    expect(isDocumentUnavailableError(undefined)).toBe(false);
  });
});
