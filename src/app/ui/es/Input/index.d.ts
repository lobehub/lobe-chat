/// <reference types="react" />
import { type InputProps as AntdInputProps, type InputRef } from 'antd';
import { TextAreaProps as AntdTextAreaProps, type TextAreaRef } from 'antd/es/input/TextArea';
export interface InputProps extends AntdInputProps {
    /**
     * @description Type of the input
     * @default 'ghost'
     */
    type?: 'ghost' | 'block' | 'pure';
}
export declare const Input: import("react").ForwardRefExoticComponent<InputProps & import("react").RefAttributes<InputRef>>;
export interface TextAreaProps extends AntdTextAreaProps {
    /**
     * @description Whether to enable resizing of the textarea
     * @default true
     */
    resize?: boolean;
    /**
     * @description Type of the textarea
     * @default 'ghost'
     */
    type?: 'ghost' | 'block' | 'pure';
}
export declare const TextArea: import("react").ForwardRefExoticComponent<TextAreaProps & import("react").RefAttributes<TextAreaRef>>;
