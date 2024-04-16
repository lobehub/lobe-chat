/// <reference types="react" />
import { ImageProps } from 'antd';
import { DivProps, ImgProps } from "../types";
export interface EmptyCardProps extends DivProps {
    alt?: string;
    cover?: string;
    defaultVisible?: boolean;
    desc: string;
    height?: number;
    imageProps?: ImgProps & ImageProps & {
        priority?: boolean;
    };
    onVisibleChange?: (visible: boolean) => void;
    title: string;
    visible?: boolean;
    width?: number;
}
declare const EmptyCard: import("react").NamedExoticComponent<EmptyCardProps>;
export default EmptyCard;
