import { DivProps } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import Image from 'next/image';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { DEFAULT_USER_AVATAR_URL } from '@/const/meta';

export const useStyles = createStyles(({ css, token }) => ({
  banner: css`
    position: relative;

    overflow: hidden;

    height: 172px;
    min-height: 172px;
    max-height: 172px;
  `,
  bannerBox: css`
    position: relative;

    width: 100%;
    height: 100%;

    background: ${token.colorBgLayout};

    mask-image: linear-gradient(to bottom, #fff, transparent);
  `,
  bannerImg: css`
    position: absolute;
    top: -50%;
    filter: blur(100px) saturate(2);
  `,
}));

interface AgentCardBannerProps extends DivProps {
  avatar: string;
  size?: number;
}

const AvatarBanner = memo<AgentCardBannerProps>(
  ({ avatar, className, size = 200, children, ...props }) => {
    const { styles, cx } = useStyles();

    return (
      <Flexbox
        align={'center'}
        className={cx(styles.banner, className)}
        justify={'center'}
        {...props}
      >
        <Flexbox align={'center'} className={styles.bannerBox} justify={'center'}>
          <Image
            alt={'banner'}
            className={styles.bannerImg}
            height={size}
            src={avatar || DEFAULT_USER_AVATAR_URL}
            unoptimized
            width={size}
          />
        </Flexbox>
        {children}
      </Flexbox>
    );
  },
);

export default AvatarBanner;
