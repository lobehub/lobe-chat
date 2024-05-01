import { Avatar, DivProps } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

export const useStyles = createStyles(({ css, token }) => ({
  banner: css`
    position: relative;

    overflow: hidden;

    height: 64px;
    margin-bottom: -56px;

    background: ${token.colorFillSecondary};
  `,
  bannerImg: css`
    position: absolute;
    filter: blur(40px) saturate(1.5);
  `,
}));

interface AgentCardBannerProps extends DivProps {
  avatar?: string;
  mask?: boolean;
  maskColor?: string;
  size?: number;
}

const AgentCardBanner = memo<AgentCardBannerProps>(
  ({ avatar, className, size = 600, children, ...props }) => {
    const { styles, cx } = useStyles();

    return (
      <Flexbox
        align={'center'}
        className={cx(styles.banner, className)}
        justify={'center'}
        {...props}
      >
        <Avatar
          alt={'banner'}
          avatar={avatar}
          className={styles.bannerImg}
          shape={'square'}
          size={size}
        />
        {children}
      </Flexbox>
    );
  },
);

export default AgentCardBanner;
