'use client';

import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Center } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  banner: css`
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;

    width: 100%;
    height: 160px;
    padding: 16px;

    @media (max-width: 1720px) {
      height: 144px;
      padding: 0;
    }
  `,
  bannerAvatar: css`
    filter: blur(100px);

    @media (max-width: 1024px) {
      filter: blur(60px);
    }
  `,
  bannerInner: css`
    position: relative;

    overflow: hidden;

    width: 100%;
    height: 100%;
    border-radius: ${token.borderRadiusLG}px;

    background: ${token.colorFillTertiary};

    @media (max-width: 1720px) {
      border-radius: 0;
    }
  `,
  button: css`
    position: absolute;
    inset-block-end: -16px;
    inset-inline-end: 16px;
  `,
}));

const Banner = memo<{ avatar?: string | null }>(({ avatar }) => {
  const { styles } = useStyles();
  return (
    <>
      <div className={styles.banner}>
        <Center className={styles.bannerInner}>
          {avatar && (
            <div
              className={styles.bannerAvatar}
              style={{
                backgroundImage: `url(${avatar})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                height: '100%',
                width: '100%',
              }}
            />
          )}
        </Center>
      </div>
      <div
        style={{
          height: 64,
          position: 'relative',
          width: '100%',
        }}
      />
    </>
  );
});

export default Banner;
