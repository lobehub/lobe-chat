import { CSSProperties, ReactNode } from 'react';
import { DivProps } from "../types";
export interface ChatHeaderProps extends DivProps {
    classNames?: {
        left?: string;
        right?: string;
    };
    contentStyles?: {
        left?: CSSProperties;
        right?: CSSProperties;
    };
    gap?: {
        left?: number;
        right?: number;
    };
    left?: ReactNode;
    onBackClick?: () => void;
    right?: ReactNode;
    showBackButton?: boolean;
}
declare const ChatHeader: import("react").NamedExoticComponent<ChatHeaderProps>;
export default ChatHeader;
