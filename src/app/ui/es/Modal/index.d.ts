/// <reference types="react" />
import { type ModalProps as AntModalProps } from 'antd';
export type ModalProps = AntModalProps & {
    allowFullscreen?: boolean;
    maxHeight?: string | number | false;
    paddings?: {
        desktop?: number;
        mobile?: number;
    };
};
declare const Modal: import("react").NamedExoticComponent<ModalProps>;
export default Modal;
