interface LoadMoreFooterParams {
  /** A page (head revalidation or "load more") is in flight. */
  isLoading?: boolean;
  /** Failure of the last "load more" request. */
  loadMoreError?: unknown;
}

export type LoadMoreFooterState = 'error' | 'loading' | undefined;

/**
 * What a paginated memory list renders below its rows: the loading rows while a
 * page is in flight, otherwise the failure of the last "load more" (with a
 * retry) — the item count did not change, so the virtualized list would never
 * reach its end again on its own.
 */
export const resolveLoadMoreFooter = ({
  isLoading,
  loadMoreError,
}: LoadMoreFooterParams): LoadMoreFooterState => {
  if (isLoading) return 'loading';
  if (loadMoreError) return 'error';
  return undefined;
};

/**
 * Whether reaching the end of the list may request the next page. A failed page
 * waits for an explicit retry instead of re-firing on every scroll to the end.
 */
export const canAutoLoadMore = ({
  hasMore,
  loadMoreError,
}: {
  hasMore?: boolean;
  loadMoreError?: unknown;
}): boolean => Boolean(hasMore) && !loadMoreError;
