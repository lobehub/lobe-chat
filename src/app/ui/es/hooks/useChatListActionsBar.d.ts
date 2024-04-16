import { ActionIconGroupItems } from "../ActionIconGroup";
interface ChatListActionsBar {
    copy: ActionIconGroupItems;
    del: ActionIconGroupItems;
    divider: {
        type: 'divider';
    };
    edit: ActionIconGroupItems;
    regenerate: ActionIconGroupItems;
}
export declare const useChatListActionsBar: (text?: {
    copy?: string;
    delete?: string;
    edit?: string;
    regenerate?: string;
}) => ChatListActionsBar;
export {};
