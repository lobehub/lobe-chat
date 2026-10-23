import type { ChannelViewParams } from '@/services/channel';

import { channelViewKey } from './projection';
import type { ChannelState } from './store';

export const channelSelectors = {
  detail: (params: ChannelViewParams) => (state: ChannelState) =>
    state.detailMap[channelViewKey(params)],
  list: (state: ChannelState) => state.listMap.all,
};
