import {
  LobeChatGroupChatConfig,
  LobeChatGroupFullConfig,
  LobeChatGroupMetaConfig,
} from '@lobechat/types';

import { DEFAULT_MODEL, DEFAULT_PROVIDER } from './llm';

export const DEFAULT_CHAT_GROUP_CHAT_CONFIG: LobeChatGroupChatConfig = {
  allowDM: true,
  enableSupervisor: true,
  maxResponseInRow: 10,
  orchestratorModel: DEFAULT_MODEL,
  orchestratorProvider: DEFAULT_PROVIDER,
  responseOrder: 'natural',
  responseSpeed: 'fast',
  revealDM: false,
  scene: 'productive',
  systemPrompt: '',
};

export const DEFAULT_CHAT_GROUP_META_CONFIG: LobeChatGroupMetaConfig = {
  description: '',
  title: '',
};

export const DEFAULT_CHAT_GROUP_CONFIG: LobeChatGroupFullConfig = {
  chat: DEFAULT_CHAT_GROUP_CHAT_CONFIG,
  meta: DEFAULT_CHAT_GROUP_META_CONFIG,
};
