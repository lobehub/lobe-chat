import { isTrpcErrorCode } from '@/utils/trpcError';

/**
 * Whether a page section failed because the document itself is closed to this
 * member (another member's private page) or gone. The body already explains that
 * state, so sections below it (likes, comments) render nothing instead of
 * stacking their own failures under it.
 */
export const isDocumentUnavailableError = (error: unknown): boolean =>
  isTrpcErrorCode(error, 'FORBIDDEN') || isTrpcErrorCode(error, 'NOT_FOUND');
