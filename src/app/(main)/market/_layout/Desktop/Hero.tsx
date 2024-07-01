'use client';

import { GridBackground } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Center } from 'react-layout-kit';

const useStyles = createStyles(({ css, responsive }) => ({
  background: css`
    width: 80%;
    margin-block: -60px -20px;
    margin-inline: 0;

    ${responsive.md} {
      display: none;
    }
  `,
  title: css`
    z-index: 2;

    margin-block-start: 24px;

    font-size: min(56px, 5vw);
    font-weight: 800;
    line-height: 1.2;
    text-align: center;
  `,
}));

const Hero = memo(() => {
  const { theme, styles } = useStyles();
  return (
    <Center>
      <h1 className={styles.title}>Find & Use The Best Assistants</h1>
      <GridBackground animation className={styles.background} colorFront={theme.colorText} random />
    </Center>
  );
});

export default Hero;
