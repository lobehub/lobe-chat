/// <reference types="react" />
import { DivProps } from "../types";
export interface VideoProps extends DivProps {
    autoplay?: boolean;
    borderless?: boolean;
    classNames?: {
        video?: string;
        wrapper?: string;
    };
    height?: number | string;
    isLoading?: boolean;
    loop?: boolean;
    minSize?: number | string;
    muted?: HTMLVideoElement['muted'];
    onload?: HTMLVideoElement['onload'];
    poster?: string;
    preload?: HTMLVideoElement['preload'];
    preview?: boolean;
    size?: number | string;
    src: string;
    width?: number | string;
}
declare const Video: import("react").NamedExoticComponent<VideoProps>;
export default Video;
