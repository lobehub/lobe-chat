import { type AvatarProps as AntAvatarProps } from 'antd';
import { type ReactNode } from 'react';
export interface AvatarProps extends AntAvatarProps {
    animation?: boolean;
    /**
     * @description The URL or base64 data of the avatar image
     */
    avatar?: string | ReactNode;
    /**
     * @description The background color of the avatar
     */
    background?: string;
    /**
     * @description The shape of the avatar
     * @default 'circle'
     */
    shape?: 'circle' | 'square';
    /**
     * @description The size of the avatar in pixels
     * @default 40
     */
    size?: number;
    /**
     * @description The title text to display if avatar is not provided
     */
    title?: string;
    unoptimized?: boolean;
}
declare const Avatar: import("react").NamedExoticComponent<AvatarProps>;
export default Avatar;
