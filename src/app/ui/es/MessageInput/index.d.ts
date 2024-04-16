import { ButtonProps } from 'antd';
import { type CSSProperties } from 'react';
import { type TextAreaProps } from "../Input";
import { DivProps } from "../types";
export interface MessageInputProps extends DivProps {
    /**
     * @description Additional className to apply to the component.
     */
    className?: string;
    classNames?: TextAreaProps['classNames'];
    /**
     * @description The default value of the input box.
     */
    defaultValue?: string;
    editButtonSize?: ButtonProps['size'];
    height?: number | 'auto' | string;
    /**
     * @description Callback function triggered when user clicks on the cancel button.
     */
    onCancel?: () => void;
    /**
     * @description Callback function triggered when user clicks on the confirm button.
     * @param text - The text input by the user.
     */
    onConfirm?: (text: string) => void;
    /**
     * @description Custom rendering of the bottom buttons.
     * @param text - The text input by the user.
     */
    renderButtons?: (text: string) => ButtonProps[];
    text?: {
        cancel?: string;
        confirm?: string;
    };
    textareaClassname?: string;
    textareaStyle?: CSSProperties;
    /**
     * @description The type of the input box.
     */
    type?: TextAreaProps['type'];
}
declare const MessageInput: import("react").NamedExoticComponent<MessageInputProps>;
export default MessageInput;
