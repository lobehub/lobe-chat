import { Avatar as A } from '@lobehub/ui';
import { type CSSProperties, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useStyles } from '../style';
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
  ({ loading, avatar, placement, unoptimized, addon, onClick, size = 40, style, alt }) => {
    const { styles } = useStyles({ avatarSize: size });
    const avatarContent = (
      <div className={styles.avatarContainer} style={style}>
        <A
          alt={alt || avatar.title}
          animation={loading}
          avatar={avatar.avatar}
          background={avatar.backgroundColor}
          onClick={onClick}
          size={size}
          title={avatar.title}
          unoptimized={unoptimized}
        />
        <Loading loading={loading} placement={placement} />
      </div>
    );

    if (!addon) return avatarContent;
    return (
      <Flexbox align={'center'} className={styles.avatarGroupContainer} gap={8}>
        {avatarContent}
        {addon}
      </Flexbox>
    );
  },
);

export default Avatar;
