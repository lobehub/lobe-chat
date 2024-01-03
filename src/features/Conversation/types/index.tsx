import { type AlertProps, type ChatItemProps } from '@lobehub/ui';
import { ActionEvent } from '@lobehub/ui';
import { FC, ReactNode } from 'react';

import { LLMRoleType } from '@/types/llm';
import { ChatMessage } from '@/types/message';

import { type ActionsBarProps } from '../components/ChatItem/ActionsBar';

export type OnMessageChange = (id: string, content: string) => void;
export type OnActionsClick = (action: ActionEvent, message: ChatMessage) => void;
export type OnAvatarsClick = (role: RenderRole) => ChatItemProps['onAvatarClick'];
export type RenderRole = LLMRoleType | 'default' | string;
export type RenderMessage = FC<ChatMessage & { editableContent: ReactNode }>;
export type RenderMessageExtra = FC<ChatMessage>;
export interface RenderErrorMessage {
  Render?: FC<ChatMessage>;
  config?: AlertProps;
}
export type RenderAction = FC<ActionsBarProps & ChatMessage>;
