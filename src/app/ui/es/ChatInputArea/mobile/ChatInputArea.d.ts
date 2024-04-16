import { TextAreaRef } from 'antd/es/input/TextArea';
import { CSSProperties, ReactNode } from 'react';
import { type ChatInputAreaInnerProps } from '../ChatInputAreaInner';
export interface MobileChatInputAreaProps extends ChatInputAreaInnerProps {
    bottomAddons?: ReactNode;
    expand?: boolean;
    safeArea?: boolean;
    setExpand?: (expand: boolean) => void;
    style?: CSSProperties;
    textAreaLeftAddons?: ReactNode;
    textAreaRightAddons?: ReactNode;
    topAddons?: ReactNode;
}
declare const MobileChatInputArea: import("react").ForwardRefExoticComponent<MobileChatInputAreaProps & import("react").RefAttributes<TextAreaRef>>;
export default MobileChatInputArea;
