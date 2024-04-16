/// <reference types="react" />
import { ImageProps } from 'antd';
import { ImgProps } from "../types";
declare const Img: import("react").ForwardRefExoticComponent<ImgProps & ImageProps & {
    unoptimized?: boolean | undefined;
} & import("react").RefAttributes<any>>;
export default Img;
