import { CSSProperties, FC } from 'react';
export interface VideoProps {
    borderless?: boolean;
    className?: string;
    cover?: boolean;
    height?: number;
    inStep?: boolean;
    poster?: string;
    src: string;
    style?: CSSProperties;
    width?: number;
}
declare const Video: FC<VideoProps>;
export default Video;
