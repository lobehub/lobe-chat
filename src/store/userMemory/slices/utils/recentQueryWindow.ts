import { readReplicaStoredKeys, type ReplicaResource } from '@/libs/replica';

/**
 * How many distinct search / sort page sets a memory list keeps. The query on
 * screen is always the most recent, so bounding the window bounds memory and
 * IndexedDB together: searching all day cannot grow either without limit, and
 * the queries just used still paint from their own rows.
 */
export const MAX_RECENT_MEMORY_QUERIES = 8;

interface RecentQueryWindowOptions {
  /** Drop one query's entry and its persisted row (`slice.remove`). */
  evict: (key: string) => unknown;
  /**
   * The list resource. Its entry keys must equal its storage keys (no replica
   * `query`), so the persisted index lists the entry keys.
   */
  resource: Pick<ReplicaResource<any, any, any>, 'scope' | 'storage'>;
}

/**
 * The bounded recent-query window of a memory list keyed per query: tracks the
 * queries the user looks at, seeds itself once per user from the keys an
 * earlier session persisted, and evicts the least recently used past
 * {@link MAX_RECENT_MEMORY_QUERIES} — in memory and in IndexedDB together.
 */
export class RecentQueryWindow {
  readonly #evict: (key: string) => unknown;
  /** Entry keys used, oldest first. */
  #recent: string[] = [];
  readonly #resource: RecentQueryWindowOptions['resource'];
  /** Partition the recency list belongs to. */
  #scope?: string;
  /** Whether the persisted keys are already folded in. */
  #seeded = false;

  constructor({ evict, resource }: RecentQueryWindowOptions) {
    this.#evict = evict;
    this.#resource = resource;
  }

  #evictOld = (): void => {
    while (this.#recent.length > MAX_RECENT_MEMORY_QUERIES) {
      const oldest = this.#recent.shift();
      if (oldest) this.#evict(oldest);
    }
  };

  /**
   * Fold the keys an earlier session persisted into the window, once per user:
   * a window that starts empty on every page load would bound nothing across
   * reloads.
   */
  #seed = (): void => {
    const scope = this.#resource.scope.get();
    if (this.#scope !== scope) {
      // Another user owns the partition: start the window over.
      this.#recent = [];
      this.#scope = scope;
      this.#seeded = false;
    }
    if (this.#seeded) return;
    this.#seeded = true;

    void readReplicaStoredKeys(this.#resource).then((persisted) => {
      if (this.#scope !== scope) return;
      // The index is append-ordered (oldest first); prepending keeps that order,
      // so eviction drops the least recently used persisted query first.
      for (const key of [...persisted].reverse()) {
        if (!this.#recent.includes(key)) this.#recent.unshift(key);
      }
      this.#evictOld();
    });
  };

  /** Remember the query on screen as the most recent one. Call from an effect, never during render. */
  track = (key: string): void => {
    this.#seed();
    const existing = this.#recent.indexOf(key);
    if (existing !== -1) this.#recent.splice(existing, 1);
    this.#recent.push(key);
    this.#evictOld();
  };
}
