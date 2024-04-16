/// <reference types="react" />
import { type InputRef } from 'antd';
import { InputProps } from "../Input";
export interface ControlInputProps extends Omit<InputProps, 'onChange' | 'value' | 'onAbort'> {
    /**
     * @description Callback function that is triggered when the input value changes
     */
    onChange?: (value: string) => void;
    /**
     * @description Callback function that is triggered when the input value has stopped changing
     */
    onChangeEnd?: (value: string) => void;
    /**
     * @description Callback function that is triggered when the input value is changing
     */
    onValueChanging?: (value: string) => void;
    /**
     * @description The initial value of the input
     */
    value?: string;
}
export declare const ControlInput: import("react").ForwardRefExoticComponent<ControlInputProps & import("react").RefAttributes<InputRef>>;
