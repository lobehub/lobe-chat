import { LocalStorageReplicaStorage } from '@lobechat/replica';
import superjson from 'superjson';

import type { QueryProjection, QueryProjectionCodec } from './types';

interface LocalStorageQueryProjectionStorageOptions<T> {
  codec?: QueryProjectionCodec<T>;
  namespace: string;
}

/** Replica rows in `localStorage`, serialized with superjson so `Date` and friends survive. */
export class LocalStorageQueryProjectionStorage<T> extends LocalStorageReplicaStorage<T> {
  constructor({ codec, namespace }: LocalStorageQueryProjectionStorageOptions<T>) {
    super({
      codec: codec ?? {
        parse: superjson.parse<QueryProjection<T>>,
        stringify: superjson.stringify,
      },
      namespace,
    });
  }
}
