import { DEFAULT_AVATAR, DEFAULT_USER_AVATAR } from '@lobechat/const';
import type { ChannelPublicMember, ChannelPublicMessage } from '@lobechat/types';

export const memberName = (member: ChannelPublicMember | undefined, fallback: string) =>
  member?.name || member?.userName || member?.username || fallback;

export const memberAvatar = (member: ChannelPublicMember | undefined) =>
  member?.actorType === 'user'
    ? member.userAvatar || DEFAULT_USER_AVATAR
    : member?.avatar || DEFAULT_AVATAR;

export const authorAvatar = (author: ChannelPublicMessage['author']) =>
  author.avatar || (author.type === 'user' ? DEFAULT_USER_AVATAR : DEFAULT_AVATAR);
