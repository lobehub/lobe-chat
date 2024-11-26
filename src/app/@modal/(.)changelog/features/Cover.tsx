'use client';

import { createStyles } from 'antd-style';
import Image from 'next/image';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(
  ({ css, token }) => css`
    position: relative;
    overflow: hidden;
    background: ${token.colorFillSecondary};

    &::before {
      content: '';

      position: absolute;
      z-index: 1;
      inset-block-start: 0;
      inset-inline-start: 0;

      width: 100%;
      height: 1px;

      background: ${token.colorFillTertiary};
    }

    &::after {
      content: '';

      position: absolute;
      z-index: 1;
      inset-block-end: 0;
      inset-inline-start: 0;

      width: 100%;
      height: 1px;

      background: ${token.colorFillTertiary};
    }
  `,
);

const Cover = memo<{ alt: string; mobile?: boolean; src: string }>(({ alt, mobile, src }) => {
  const { styles } = useStyles();
  return (
    <Flexbox className={styles}>
      <Image
        alt={alt}
        height={mobile ? 187 : 309}
        src={src}
        style={{
          height: 'auto',
          width: '100%',
        }}
        unoptimized
        width={600}
      />
    </Flexbox>
  );
});

export default Cover;
