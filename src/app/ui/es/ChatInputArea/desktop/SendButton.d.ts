import { CSSProperties, ReactNode } from 'react';
export interface ChatSendButtonProps {
    className?: string;
    leftAddons?: ReactNode;
    loading?: boolean;
    onSend?: () => void;
    onStop?: () => void;
    rightAddons?: ReactNode;
    style?: CSSProperties;
    texts?: {
        send?: string;
        stop?: string;
        warp?: string;
    };
}
declare const ChatSendButton: import("react").NamedExoticComponent<ChatSendButtonProps>;
export default ChatSendButton;
