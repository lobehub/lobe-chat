export interface QueryProjectionKey {
  queryKey: string;
  scope: string;
}

export interface QueryProjection<T> {
  data: T;
  updatedAt: number;
}

export interface QueryProjectionStorage<T> {
  get: (key: QueryProjectionKey) => Promise<QueryProjection<T> | undefined>;
  /** Rejects when the delete did not land (reads and writes stay best-effort). */
  remove: (key: QueryProjectionKey) => Promise<void>;
  set: (key: QueryProjectionKey, projection: QueryProjection<T>) => Promise<void>;
}

export interface QueryProjectionCodec<T> {
  parse: (value: string) => QueryProjection<T>;
  stringify: (projection: QueryProjection<T>) => string;
}
