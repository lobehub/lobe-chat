import { type AlertProps as AntAlertProps } from 'antd';
import { type ReactNode } from 'react';
export interface AlertProps extends AntAlertProps {
    classNames?: {
        alert?: string;
        container?: string;
    };
    colorfulText?: boolean;
    extra?: ReactNode;
    extraDefaultExpand?: boolean;
    extraIsolate?: boolean;
    text?: {
        detail?: string;
    };
    variant?: 'default' | 'block' | 'ghost' | 'pure';
}
declare const Alert: import("react").NamedExoticComponent<AlertProps>;
export default Alert;
