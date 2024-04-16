import { SelectProps } from 'antd';
import { type CSSProperties, ReactNode } from 'react';
import { IconProps } from "../Icon";
export interface SelectWithImgOptionItem {
    ariaLabel?: string;
    icon?: IconProps['icon'];
    img: string;
    label: ReactNode;
    value: string;
}
export interface SelectWithImgProps {
    className?: string;
    classNames?: {
        img?: string;
    };
    defaultValue?: SelectProps['defaultValue'];
    height?: number;
    onChange?: (value: this['value']) => void;
    options?: SelectWithImgOptionItem[];
    style?: CSSProperties;
    styles?: {
        img?: CSSProperties;
    };
    unoptimized?: boolean;
    value?: SelectProps['value'];
    width?: number;
}
declare const SelectWithImg: import("react").NamedExoticComponent<SelectWithImgProps>;
export default SelectWithImg;
