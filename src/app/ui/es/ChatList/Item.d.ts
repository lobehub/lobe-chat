import { FC, ReactNode } from 'react';
import { ActionEvent } from "../ActionIconGroup";
import type { AlertProps } from "../Alert";
import { type ChatItemProps } from "../ChatItem";
import { ChatMessage } from "../types/chatMessage";
import { LLMRoleType } from "../types/llm";
import { type ActionsBarProps } from './ActionsBar';
export type OnMessageChange = (id: string, content: string) => void;
export type OnActionsClick = (action: ActionEvent, message: ChatMessage) => void;
export type OnAvatatsClick = (role: RenderRole) => ChatItemProps['onAvatarClick'];
export type RenderRole = LLMRoleType | 'default' | string;
export type RenderItem = FC<{
    key: string;
} & ChatMessage & ListItemProps>;
export type RenderMessage = FC<ChatMessage & {
    editableContent: ReactNode;
}>;
export type RenderMessageExtra = FC<ChatMessage>;
export interface RenderErrorMessage {
    Render?: FC<ChatMessage>;
    config?: AlertProps;
}
export type RenderAction = FC<ActionsBarProps & ChatMessage>;
export interface ListItemProps {
    groupNav?: ChatItemProps['avatarAddon'];
    loading?: boolean;
    /**
     * @description 点击操作按钮的回调函数
     */
    onActionsClick?: OnActionsClick;
    onAvatarsClick?: OnAvatatsClick;
    /**
     * @description 消息变化的回调函数
     */
    onMessageChange?: OnMessageChange;
    renderActions?: {
        [actionKey: string]: RenderAction;
    };
    /**
     * @description 渲染错误消息的函数
     */
    renderErrorMessages?: {
        [errorType: 'default' | string]: RenderErrorMessage;
    };
    renderItems?: {
        [role: RenderRole]: RenderItem;
    };
    /**
     * @description 渲染消息的函数
     */
    renderMessages?: {
        [role: RenderRole]: RenderMessage;
    };
    /**
     * @description 渲染消息额外内容的函数
     */
    renderMessagesExtra?: {
        [role: RenderRole]: RenderMessageExtra;
    };
    /**
     * @description 是否显示聊天项的名称
     * @default false
     */
    showTitle?: boolean;
    /**
     * @description 文本内容
     */
    text?: ChatItemProps['text'] & ActionsBarProps['text'] & {
        copySuccess?: string;
        history?: string;
    } & {
        [key: string]: string;
    };
    /**
     * @description 聊天列表的类型
     * @default 'chat'
     */
    type?: 'docs' | 'chat';
}
export type ChatListItemProps = ChatMessage & ListItemProps;
declare const Item: import("react").NamedExoticComponent<ChatListItemProps>;
export default Item;
