import type { ChannelDetail, ChannelListItem } from '@lobechat/types';

import { lambdaClient } from '@/libs/trpc/client';

export interface ChannelAgentSelection {
  agentId: string;
  description?: string;
  deviceId?: string;
  name?: string;
  workingDirectory?: string;
}

export interface ChannelViewParams {
  before?: number;
  channelId: string;
  threadId?: string | null;
}

class ChannelService {
  addAgent = (channelId: string, agent: ChannelAgentSelection) =>
    lambdaClient.channel.addAgent.mutate({ agent, channelId });
  create = (input: { agents: ChannelAgentSelection[]; title: string }) =>
    lambdaClient.channel.create.mutate(input);
  createThread = (channelId: string, rootMessageId: string, followerMemberIds: string[]) =>
    lambdaClient.channel.createThread.mutate({ channelId, followerMemberIds, rootMessageId });
  detail = async (params: ChannelViewParams): Promise<ChannelDetail> =>
    (await lambdaClient.channel.detail.query(params)).data;
  list = async (): Promise<ChannelListItem[]> => (await lambdaClient.channel.list.query()).data;
  markRead = (channelId: string, sequence: number) =>
    lambdaClient.channel.markRead.mutate({ channelId, sequence });
  send = (input: {
    channelId: string;
    content: string;
    fileIds?: string[];
    mentions: string[];
    requestKey: string;
    threadId?: string | null;
  }) => lambdaClient.channel.send.mutate(input);
  stop = (channelId: string, scope: { jobId: string } | { threadId: string | null }) =>
    lambdaClient.channel.stop.mutate({ channelId, scope });
}

export const channelService = new ChannelService();
