import { ImageProps } from 'antd';
import { PropsWithChildren, ReactNode } from 'react';
export interface ImageGalleryProps extends PropsWithChildren {
    enable?: boolean;
    items?: string[];
    preview?: ImageProps['preview'] & {
        toolbarAddon?: ReactNode;
    } & any;
}
declare const ImageGallery: import("react").NamedExoticComponent<ImageGalleryProps>;
export default ImageGallery;
