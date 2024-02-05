import { type ChatItemProps } from '@lobehub/ui';
import { ActionEvent } from '@lobehub/ui';
import { FC, ReactNode } from 'react';

import { LLMRoleType } from '@/types/llm';
import { ChatMessage } from '@/types/message';

import { type ActionsBarProps } from '../components/ChatItem/ActionsBar';

export type OnActionsClick = (action: ActionEvent, message: ChatMessage) => void;
export type OnAvatarsClick = (role: RenderRole) => ChatItemProps['onAvatarClick'];
export type RenderRole = LLMRoleType | 'default' | string;
export type RenderMessage = FC<ChatMessage & { editableContent: ReactNode }>;
export type RenderMessageExtra = FC<ChatMessage>;

export type RenderAction = FC<ActionsBarProps & ChatMessage>;

export type RenderItem = FC<{ key: string } & ChatMessage & ListItemProps>;

export interface ListItemProps {
  groupNav?: ChatItemProps['avatarAddon'];

  renderItems?: {
    [role: RenderRole]: RenderItem;
  };

  /**
   * @description 是否显示聊天项的名称
   * @default false
   */
  showTitle?: boolean;
}
