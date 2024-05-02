'use client';

import { createStyles } from 'antd-style';
import { PropsWithChildren, memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

export const useStyles = createStyles(({ css, token }) => ({
  avatar: css`
    position: absolute;
    z-index: 10;

    flex: none;

    background: ${token.colorBgContainer};
    border: 6px solid ${token.colorBgContainer};
    border-radius: 50%;
  `,
  banner: css`
    position: relative;
    flex: none;
  `,
  bannerBox: css`
    position: relative;

    overflow: hidden;

    width: 100%;
    height: 180px;

    background: ${token.colorBgLayout};
  `,
  bannerImg: css`
    position: absolute;
    scale: 5;
    filter: blur(24px) saturate(2);
  `,
}));

const AvatarBanner = memo<PropsWithChildren>(({ children }) => {
  const { styles } = useStyles();

  return (
    <Flexbox align={'center'} className={styles.banner} justify={'center'} width={'100%'}>
      <Flexbox align={'center'} className={styles.bannerBox} justify={'center'}>
        <div className={styles.bannerImg}>{children}</div>
      </Flexbox>
      <Center className={styles.avatar}>{children}</Center>
    </Flexbox>
  );
});

export default AvatarBanner;
