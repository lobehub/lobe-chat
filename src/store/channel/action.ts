import { channelService, type ChannelViewParams } from '@/services/channel';

import { ChannelPrivateAction } from './privateAction';
import { initialState, useChannelStore } from './store';

class ChannelActionImpl {
  readonly #private = new ChannelPrivateAction(useChannelStore.setState, useChannelStore.getState);
  useFetchList = () => this.#private.list.useSync({}, { refreshInterval: 30_000 });
  useFetchDetail = (params: ChannelViewParams | null) =>
    this.#private.detail.useSync(params, { refreshInterval: 30_000 });
  refreshList = () => this.#private.list.fetch({}, { fresh: true });
  refreshDetail = (params: ChannelViewParams) =>
    this.#private.detail.fetch(params, { fresh: true });
  create = async (input: Parameters<typeof channelService.create>[0]) => {
    const result = await channelService.create(input);
    await this.refreshList();
    return result.data.channel.id;
  };
  send = async (input: Parameters<typeof channelService.send>[0]) => {
    await channelService.send(input);
    await Promise.all([
      this.refreshDetail({ channelId: input.channelId, threadId: input.threadId }),
      this.refreshList(),
    ]);
  };
  stop = async (channelId: string, scope: Parameters<typeof channelService.stop>[1]) => {
    await channelService.stop(channelId, scope);
    await this.refreshDetail({ channelId, threadId: 'threadId' in scope ? scope.threadId : null });
  };
  reset = () => useChannelStore.setState(initialState, false, 'channel/reset');
}

export const channelActions = new ChannelActionImpl();
