import type { ReplicaRow, ReplicaRowCodec, ReplicaRowKey, ReplicaStorage } from '@lobechat/replica';

export type QueryProjectionKey = ReplicaRowKey;

export type QueryProjection<T> = ReplicaRow<T>;

/** A replica storage whose strict read is required: replicas refuse destructive passes without it. */
export type QueryProjectionStorage<T> = Required<ReplicaStorage<T>>;

export type QueryProjectionCodec<T> = ReplicaRowCodec<T>;
