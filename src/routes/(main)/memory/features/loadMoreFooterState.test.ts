import { describe, expect, it } from 'vitest';

import { canAutoLoadMore, resolveLoadMoreFooter } from './loadMoreFooterState';

describe('resolveLoadMoreFooter', () => {
  it('shows the loading rows while a page is in flight', () => {
    expect(resolveLoadMoreFooter({ isLoading: true })).toBe('loading');
    expect(resolveLoadMoreFooter({ isLoading: true, loadMoreError: new Error('x') })).toBe(
      'loading',
    );
  });

  it('shows the failure of the last page so it can be retried', () => {
    expect(resolveLoadMoreFooter({ loadMoreError: new Error('offline') })).toBe('error');
  });

  it('renders nothing once every page settled', () => {
    expect(resolveLoadMoreFooter({})).toBeUndefined();
  });
});

describe('canAutoLoadMore', () => {
  it('requests the next page at the end of the list while there is more', () => {
    expect(canAutoLoadMore({ hasMore: true })).toBe(true);
    expect(canAutoLoadMore({ hasMore: false })).toBe(false);
  });

  it('waits for an explicit retry after a failed page', () => {
    expect(canAutoLoadMore({ hasMore: true, loadMoreError: new Error('offline') })).toBe(false);
  });
});
