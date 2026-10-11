import { type ReplicaOptimisticToken } from '@/libs/replica';

/** The part of a paged replica slice the pager drives (structural, so any slice fits). */
export interface OffsetPagedSlice {
  beginEntityOptimistic: <TItem>(
    id: string,
    fn: (item: TItem) => TItem | undefined,
  ) => ReplicaOptimisticToken<any>[];
  collapse: (key: string) => unknown;
  loadMore: (key: string) => Promise<void>;
  removeEntity: (id: string) => void;
  update: (key: string, apply: (data: any) => any, options?: { persist?: boolean }) => unknown;
}

interface OffsetListPagerOptions {
  /** Entry keys loaded in memory (every page set a delete may have shifted). */
  keys: () => string[];
  /**
   * Re-read the head page of the mounted query through the list's own SWR key
   * (the awaitable bare `mutate(matcher)` form). Resolves once the refetch
   * settled, whether or not it succeeded.
   */
  refreshHead: () => Promise<unknown>;
  slice: OffsetPagedSlice;
}

/** Shown on the footer when the head could not be refreshed and no request error is known. */
const staleHeadError = () => new Error('Failed to refresh the list before loading more');

/**
 * Delete / "load more" / purge for an offset-paged memory list.
 *
 * The memory lists page by offset (cursor = page index), so a server-side
 * delete shifts every later row one slot up: the next page asked for with the
 * loaded cursor would skip the row that crossed the page boundary. The pager
 * repairs that the same way for every list:
 *
 * - **Delete**: the row leaves every loaded page set at once (optimistic, rolled
 *   back if the server rejects). Once the server confirms, `removeEntity` drops
 *   it from persisted rows too, every loaded page set collapses to its head
 *   and is marked *head-stale*, and the head is refreshed.
 * - **Head-stale guard**: "load more" on a head-stale page set first refreshes
 *   the head; it only fetches the next page once a fresh head landed
 *   (`headLanded`). If the refresh fails, the footer shows the failure with a
 *   retry instead of paging from a stale offset.
 * - **Serialization**: deletes, pages and the purge run one after another, so
 *   load-more waits for an in-flight delete + refresh, a delete waits for a
 *   page already in flight (its offset predates the shift), and a purge never
 *   races a page that would land into the emptied list.
 */
export class OffsetListPager {
  readonly #headErrors = new Map<string, unknown>();
  readonly #keys: () => string[];
  readonly #loadingMore = new Map<string, Promise<void>>();
  readonly #refreshHead: () => Promise<unknown>;
  readonly #slice: OffsetPagedSlice;
  readonly #staleHeads = new Set<string>();
  /** Serialized paging work not settled yet. */
  #inFlight = 0;
  /** Tail of the serialized paging work. */
  #tail: Promise<unknown> = Promise.resolve();

  constructor({ keys, refreshHead, slice }: OffsetListPagerOptions) {
    this.#keys = keys;
    this.#refreshHead = refreshHead;
    this.#slice = slice;
  }

  #serialize = <T>(work: () => Promise<T>): Promise<T> => {
    this.#inFlight++;
    const run = this.#tail.then(work).finally(() => {
      this.#inFlight--;
    });
    this.#tail = run.catch(() => undefined);
    return run;
  };

  /** Whether `key` must refresh its head before paging again. */
  isHeadStale = (key: string): boolean => this.#staleHeads.has(key);

  /** A head page of `key` landed: its offsets are the server's again. */
  headLanded = (key: string): void => {
    this.#staleHeads.delete(key);
    this.#headErrors.delete(key);
  };

  /** The head request of `key` failed (surfaced if paging is blocked on it). */
  headFailed = (key: string, error: unknown): void => {
    this.#headErrors.set(key, error);
  };

  /**
   * Delete one row (see the class doc). Rejects with the server error after
   * rolling the optimistic removal back.
   */
  delete = (id: string, serverCall: () => Promise<unknown>): Promise<void> => {
    const tokens = this.#slice.beginEntityOptimistic(id, () => undefined);

    return this.#serialize(async () => {
      try {
        await serverCall();
      } catch (error) {
        for (const token of tokens) token.rollback();
        throw error;
      }
      for (const token of tokens) token.commit();
      // Drop the row from every loaded and persisted page set, and keep a read
      // already in flight from bringing it back.
      this.#slice.removeEntity(id);
      for (const key of this.#keys()) {
        this.#staleHeads.add(key);
        this.#slice.collapse(key);
      }
      await this.#refreshHead();
    });
  };

  /** Append the next page of `key` once its head is trustworthy. Concurrent calls share one run. */
  loadMore = (key: string): Promise<void> => {
    const running = this.#loadingMore.get(key);
    if (running) return running;

    const run = this.#serialize(async () => {
      if (this.#staleHeads.has(key)) {
        await this.#refreshHead();
        if (this.#staleHeads.has(key)) {
          const error = this.#headErrors.get(key) ?? staleHeadError();
          this.#slice.update(
            key,
            (data) => data && { ...data, isLoadingMore: false, loadMoreError: error },
            { persist: false },
          );
          return;
        }
      }
      await this.#slice.loadMore(key);
    }).finally(() => this.#loadingMore.delete(key));

    this.#loadingMore.set(key, run);
    return run;
  };

  /**
   * Run the list's purge now — the view empties at once — and, when a page or
   * a delete is still in flight, once more after it settled, so nothing it
   * brings back survives. Nothing is head-stale afterwards.
   */
  clear = (clear: () => Promise<boolean>): Promise<boolean> => {
    this.#staleHeads.clear();
    this.#headErrors.clear();
    const now = clear();
    if (this.#inFlight === 0) return now;

    return this.#serialize(async () => {
      await now.catch(() => false);
      this.#staleHeads.clear();
      this.#headErrors.clear();
      return clear();
    });
  };
}
