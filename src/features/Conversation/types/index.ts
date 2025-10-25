import { ChatMessage } from '@lobechat/types';
import { type ChatItemProps } from '@lobehub/ui/chat';
import { FC, ReactNode } from 'react';

import { LLMRoleType } from '@/types/llm';

export type RenderRole = LLMRoleType | 'default' | 'history' | string;
export type RenderMessage = FC<ChatMessage & { editableContent: ReactNode }>;
export type RenderBelowMessage = FC<ChatMessage>;
export type RenderMessageExtra = FC<ChatMessage>;
export type MarkdownCustomRender = (props: {
  displayMode: 'chat' | 'docs';
  dom: ReactNode;
  id: string;
  text: string;
}) => ReactNode;

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
