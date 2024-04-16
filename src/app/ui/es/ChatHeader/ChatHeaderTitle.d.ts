import { ReactNode } from 'react';
export interface ChatHeaderTitleProps {
    desc?: string | ReactNode;
    tag?: ReactNode;
    title: string | ReactNode;
}
declare const ChatHeaderTitle: import("react").NamedExoticComponent<ChatHeaderTitleProps>;
export default ChatHeaderTitle;
