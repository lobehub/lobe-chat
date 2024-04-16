import { ReactNode } from 'react';
export interface ChatInputActionBarProps {
    leftAddons?: ReactNode;
    mobile?: boolean;
    padding?: number | string;
    rightAddons?: ReactNode;
}
declare const ChatInputActionBar: import("react").NamedExoticComponent<ChatInputActionBarProps>;
export default ChatInputActionBar;
