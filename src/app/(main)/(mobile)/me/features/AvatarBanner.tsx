'use client';

import { createStyles } from 'antd-style';
import { PropsWithChildren, memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

export const AVATAR_SIZE = 80;

export const useStyles = createStyles(({ css, token }) => ({
  avatar: css`
    z-index: 10;

    flex: none;

    margin-top: -${AVATAR_SIZE / 2 + 6}px;

    background: ${token.colorBgLayout};
    border: 6px solid ${token.colorBgLayout};
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
    height: 100px;

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
