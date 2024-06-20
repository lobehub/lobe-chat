'use client';

import { GridBackground } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';

const useStyles = createStyles(({ css, responsive }) => ({
  background: css`
    width: 80%;
    margin: -60px 0 -20px;

    ${responsive.md} {
      display: none;
    }
  `,
  title: css`
    z-index: 2;

    margin-top: 24px;

    font-size: min(56px, 5vw);
    font-weight: 800;
    line-height: 1.2;
    text-align: center;
  `,
}));

const Hero = memo(() => {
  const { theme, styles } = useStyles();
  const { t } = useTranslation('market');
  return (
    <Center>
      <h1 className={styles.title}>{t('title.findAgents')}</h1>
      <GridBackground animation className={styles.background} colorFront={theme.colorText} random />
    </Center>
  );
});

export default Hero;
