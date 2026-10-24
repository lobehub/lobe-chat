import type { ChannelDetail, ChannelListItem } from '@lobechat/types';

import { defineReplica } from '@/libs/replica';
import { channelService, type ChannelViewParams } from '@/services/channel';

export const channelViewKey = (params: ChannelViewParams) =>
  `${params.channelId}:${params.threadId ?? 'main'}:${params.before ?? 'latest'}`;

export const channelListResource = defineReplica<Record<string, never>, ChannelListItem[]>({
  fetcher: () => channelService.list(),
  key: () => 'all',
  name: 'channelList',
  storage: 'indexedDB',
  version: 1,
});

export const channelDetailResource = defineReplica<ChannelViewParams, ChannelDetail>({
  fetcher: channelService.detail,
  key: channelViewKey,
  name: 'channelDetail',
  storage: 'indexedDB',
  version: 1,
});
