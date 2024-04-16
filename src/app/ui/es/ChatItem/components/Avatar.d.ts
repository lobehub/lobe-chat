/// <reference types="react" />
import type { ChatItemProps } from '../type';
export interface AvatarProps {
    addon?: ChatItemProps['avatarAddon'];
    avatar: ChatItemProps['avatar'];
    loading?: ChatItemProps['loading'];
    onClick?: ChatItemProps['onAvatarClick'];
    placement?: ChatItemProps['placement'];
    size?: number;
    unoptimized?: boolean;
}
declare const Avatar: import("react").NamedExoticComponent<AvatarProps>;
export default Avatar;
