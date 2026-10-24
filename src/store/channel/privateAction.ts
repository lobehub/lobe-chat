import type { ChannelDetail, ChannelListItem } from '@lobechat/types';

import { createReplicaSlice, recordLens } from '@/libs/replica';
import type { StoreSetter } from '@/store/types';

import { channelDetailResource, channelListResource } from './projection';
import type { ChannelState } from './store';

export class ChannelPrivateAction {
  readonly detail;
  readonly list;
  constructor(set: StoreSetter<ChannelState>, get: () => ChannelState) {
    this.list = createReplicaSlice(channelListResource, {
      actionPrefix: 'channel/list',
      get,
      set,
      stateKey: 'listReplica',
      view: recordLens<ChannelState, ChannelListItem[]>('listMap'),
    });
    this.detail = createReplicaSlice(channelDetailResource, {
      actionPrefix: 'channel/detail',
      get,
      set,
      stateKey: 'detailReplica',
      view: recordLens<ChannelState, ChannelDetail>('detailMap'),
    });
  }
}
