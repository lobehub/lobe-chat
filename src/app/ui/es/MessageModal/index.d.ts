import { ReactNode } from 'react';
import { type MessageInputProps } from "../MessageInput";
import { type ModalProps } from "../Modal";
export interface MessageModalProps extends Pick<ModalProps, 'open' | 'footer'> {
    /**
     * @description Whether the message is being edited or not
     * @default false
     */
    editing?: boolean;
    extra?: ReactNode;
    height?: MessageInputProps['height'];
    /**
     * @description Callback fired when message content is changed
     */
    onChange?: (text: string) => void;
    /**
     * @description Callback fired when editing state is changed
     */
    onEditingChange?: (editing: boolean) => void;
    /**
     * @description Callback fired when open state is changed
     */
    onOpenChange?: (open: boolean) => void;
    /**
     * @description Whether the modal is open or not
     * @default false
     */
    placeholder?: string;
    text?: {
        cancel?: string;
        confirm?: string;
        edit?: string;
        title?: string;
    };
    /**
     * @description The value of the message content
     */
    value: string;
}
declare const MessageModal: import("react").NamedExoticComponent<MessageModalProps>;
export default MessageModal;
