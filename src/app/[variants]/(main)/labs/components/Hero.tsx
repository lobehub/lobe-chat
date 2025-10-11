'use client';

import { createStyles } from 'antd-style';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    width: 100%;
    max-width: 800px;
    margin-block: 0;
    margin-inline: auto;
    padding-block: 24px 8px;
    padding-inline: 16px;
  `,
  desc: css`
    color: ${token.colorTextSecondary};
  `,
  title: css`
    font-size: 22px;
    font-weight: 600;
    color: ${token.colorText};
  `,
}));

const Hero = memo(() => {
  const { styles } = useStyles();
  const { t } = useTranslation('labs');

  return (
    <div className={styles.container}>
      <Flexbox gap={8}>
        <div className={styles.title}>🪄 {t('title')}</div>
        <div className={styles.desc}>{t('desc')}</div>
      </Flexbox>
    </div>
  );
});

Hero.displayName = 'LabsHero';

export default Hero;
