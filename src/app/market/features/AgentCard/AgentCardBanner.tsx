import { Avatar, DivProps } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { MetaData } from '@/types/meta';

export const useStyles = createStyles(({ css, token }) => ({
  banner: css`
    position: relative;

    overflow: hidden;

    height: 64px;
    margin-bottom: -56px;

    background: ${token.colorFillSecondary};

    mask-image: linear-gradient(to bottom, #fff, transparent);
  `,
  bannerImg: css`
    position: absolute;
    top: -50%;
    filter: blur(50px) saturate(2);
  `,
}));

interface AgentCardBannerProps extends DivProps {
  mask?: boolean;
  maskColor?: string;
  meta: MetaData;
  size?: number;
}

const AgentCardBanner = memo<AgentCardBannerProps>(
  ({ meta, className, size = 200, children, ...props }) => {
    const { styles, cx } = useStyles();

    return (
      <Flexbox
        align={'center'}
        className={cx(styles.banner, className)}
        justify={'center'}
        {...props}
      >
        <Avatar alt={'banner'} avatar={meta.avatar} className={styles.bannerImg} size={size} />
        {children}
      </Flexbox>
    );
  },
);

export default AgentCardBanner;
