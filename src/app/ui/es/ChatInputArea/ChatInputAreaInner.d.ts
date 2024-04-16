import { TextAreaRef } from 'antd/es/input/TextArea';
import { CSSProperties } from 'react';
import { TextAreaProps } from "../Input";
export interface ChatInputAreaInnerProps extends Omit<TextAreaProps, 'onInput'> {
    className?: string;
    loading?: boolean;
    onInput?: (value: string) => void;
    onSend?: () => void;
    style?: CSSProperties;
}
declare const _default: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<ChatInputAreaInnerProps & import("react").RefAttributes<TextAreaRef>>>;
export default _default;
