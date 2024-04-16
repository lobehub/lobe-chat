import { TextAreaRef } from 'antd/es/input/TextArea';
import { ReactNode } from 'react';
import { type DraggablePanelProps } from "../../DraggablePanel";
import { type ChatInputAreaInnerProps } from '../ChatInputAreaInner';
export interface ChatInputAreaProps extends Omit<ChatInputAreaInnerProps, 'classNames'> {
    bottomAddons?: ReactNode;
    classNames?: DraggablePanelProps['classNames'];
    expand?: boolean;
    heights?: {
        headerHeight?: number;
        inputHeight?: number;
        maxHeight?: number;
        minHeight?: number;
    };
    onSizeChange?: DraggablePanelProps['onSizeChange'];
    setExpand?: (expand: boolean) => void;
    topAddons?: ReactNode;
}
declare const _default: import("react").MemoExoticComponent<import("react").ForwardRefExoticComponent<ChatInputAreaProps & import("react").RefAttributes<TextAreaRef>>>;
export default _default;
