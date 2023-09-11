import { Avatar, DivProps } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { MetaData } from '@/types/meta';

export const useStyles = createStyles(({ css, token }, maskColor: string) => ({
  banner: css`
    position: relative;

    overflow: hidden;

    height: 64px;
    margin-bottom: -56px;

    background: ${token.colorFill};
  `,
  bannerImg: css`
    filter: blur(6px) saturate(1.6);
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
  mask?: boolean;
  maskColor?: string;
  meta: MetaData;
  size?: number;
}

const AgentCardBanner = memo<AgentCardBannerProps>(
  ({ meta, className, mask, size = 8, maskColor, ...props }) => {
    const { styles, theme, cx } = useStyles(maskColor);

    return (
      <Flexbox
        align={'center'}
        className={cx(styles.banner, className)}
        justify={'center'}
        {...props}
      >
        <Avatar
          avatar={meta.avatar}
          background={meta.backgroundColor || theme.colorBgContainer}
          className={styles.bannerImg}
          style={{ transform: `scale(${size})` }}
        />
        {mask && <div className={styles.bannerMask} />}
      </Flexbox>
    );
  },
);

export default AgentCardBanner;
