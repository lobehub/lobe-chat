import { type ImageProps as AntImageProps } from 'antd';
import { ReactNode } from 'react';
export interface ImageProps extends AntImageProps {
    actions?: ReactNode;
    alwaysShowActions?: boolean;
    borderless?: boolean;
    classNames?: {
        image?: string;
        wrapper?: string;
    };
    isLoading?: boolean;
    minSize?: number | string;
    objectFit?: 'cover' | 'contain';
    preview?: AntImageProps['preview'] & {
        toolbarAddon?: ReactNode;
    };
    size?: number | string;
    toolbarAddon?: ReactNode;
}
declare const Image: import("react").NamedExoticComponent<ImageProps>;
export default Image;
