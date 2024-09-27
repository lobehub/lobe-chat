'use client';

import { createStyles } from 'antd-style';
import { rgba } from 'polished';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { BRANDING_NAME } from '@/const/branding';
import { isCustomBranding } from '@/const/version';

const useStyles = createStyles(({ css, token }) => {
  return {
    desc: css`
      font-size: min(24px, 4vw);
      font-weight: 400;
      color: ${rgba(token.colorText, 0.8)};
      text-align: center;
      text-wrap: balance;
    `,
    title: css`
      margin-block-end: 0;

      font-size: min(56px, 7vw);
      font-weight: 800;
      line-height: 1;
      text-align: center;
      text-wrap: balance;
    `,
  };
});

const Hero = memo(() => {
  const { styles } = useStyles();

  const { t } = useTranslation(['welcome', 'custom']);

  return (
    <>
      <Flexbox
        align={'center'}
        as={'h1'}
        className={styles.title}
        gap={16}
        horizontal
        justify={'center'}
        wrap={'wrap'}
      >
        <strong style={{ fontSize: 'min(56px, 8vw)' }}>{BRANDING_NAME}</strong>
        <span>
          {isCustomBranding ? t('welcome.slogan.title', { ns: 'custom' }) : t('slogan.title')}
        </span>
      </Flexbox>
      <Flexbox
        align={'center'}
        as={'h2'}
        className={styles.desc}
        horizontal
        justify={'center'}
        wrap={'wrap'}
      >
        {isCustomBranding ? t('welcome.slogan.desc1', { ns: 'custom' }) : t('slogan.desc1')}
      </Flexbox>
    </>
  );
});

export default Hero;
