import { Avatar as A } from '@lobehub/ui';
import { type CSSProperties, memo } from 'react';
import { Center } from 'react-layout-kit';

import type { ChatItemProps } from '../type';
import Loading from './Loading';

export interface AvatarProps {
  addon?: ChatItemProps['avatarAddon'];
  alt?: string;
  avatar: ChatItemProps['avatar'];
  loading?: ChatItemProps['loading'];
  onClick?: ChatItemProps['onAvatarClick'];
  placement?: ChatItemProps['placement'];
  size?: number;
  style?: CSSProperties;
  unoptimized?: boolean;
}

const Avatar = memo<AvatarProps>(
  ({ loading, avatar, placement, unoptimized, addon, onClick, size = 28, style, alt }) => {
    return (
      <Center
        flex={'none'}
        height={size}
        style={{
          position: 'relative',
          ...style,
        }}
        width={size}
      >
        <A
          alt={alt || avatar.title}
          animation={loading}
          avatar={avatar.avatar}
          background={avatar.backgroundColor}
          onClick={onClick}
          shape={'square'}
          size={size}
          title={avatar.title}
          unoptimized={unoptimized}
        />
        <Loading loading={loading} placement={placement} />
        {addon}
      </Center>
    );
  },
);

export default Avatar;
