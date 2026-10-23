import type { ChannelPublicMember } from '@lobechat/types';

export const memberName = (member: ChannelPublicMember | undefined, fallback: string) =>
  member?.name || member?.userName || member?.username || fallback;
