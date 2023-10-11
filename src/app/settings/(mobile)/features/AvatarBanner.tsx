import { DivProps } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import Image from 'next/image';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { DEFAULT_USER_AVATAR_URL } from '@/const/meta';

export const useStyles = createStyles(({ css, token }, maskColor: string) => ({
  banner: css`
    position: relative;

    overflow: hidden;

    height: 172px;
    min-height: 172px;
    max-height: 172px;

    background: ${token.colorBgLayout};
  `,
  bannerImg: css`
    position: absolute;
    top: -50%;
    filter: blur(100px) saturate(2);
  `,
  bannerMask: css`
    position: absolute;
    bottom: 0;
    left: 0;

    width: 100%;
    height: 100%;

    background: linear-gradient(to bottom, transparent, ${maskColor || token.colorBgLayout});
  `,
}));

interface AgentCardBannerProps extends DivProps {
  avatar: string;
  mask?: boolean;
  maskColor?: string;
  size?: number;
}

const AvatarBanner = memo<AgentCardBannerProps>(
  ({ avatar, className, mask, size = 200, maskColor, children, ...props }) => {
    const { styles, cx } = useStyles(maskColor);

    return (
      <Flexbox
        align={'center'}
        className={cx(styles.banner, className)}
        justify={'center'}
        {...props}
      >
        <Image
          alt={'banner'}
          className={styles.bannerImg}
          height={size}
          src={avatar || DEFAULT_USER_AVATAR_URL}
          width={size}
        />
        {mask && <div className={styles.bannerMask} />}
        {children}
      </Flexbox>
    );
  },
);

export default AvatarBanner;
