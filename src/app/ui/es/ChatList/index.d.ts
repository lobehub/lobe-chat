/// <reference types="react" />
import type { ChatMessage, DivProps } from "../types";
import { ListItemProps } from './Item';
export interface ChatListProps extends DivProps, ListItemProps {
    /**
     * @description Data of chat messages to be displayed
     */
    data: ChatMessage[];
    enableHistoryCount?: boolean;
    historyCount?: number;
    loadingId?: string;
}
export type { OnActionsClick, OnAvatatsClick, OnMessageChange, RenderAction, RenderErrorMessage, RenderItem, RenderMessage, RenderMessageExtra, } from './Item';
declare const ChatList: import("react").NamedExoticComponent<ChatListProps>;
export default ChatList;
