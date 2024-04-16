import { CSSProperties, FC } from 'react';
export interface ImageProps {
    alt: string;
    borderless?: boolean;
    className?: string;
    cover?: boolean;
    height?: number;
    inStep?: boolean;
    src: string;
    style?: CSSProperties;
    width?: number;
}
declare const Image: FC<ImageProps>;
export default Image;
