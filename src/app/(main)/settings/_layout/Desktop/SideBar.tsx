'use client';

import { createStyles } from 'antd-style';
import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import BrandWatermark from '@/components/BrandWatermark';

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    padding: 24px 12px 16px;
    background: ${token.colorBgContainer};
    border-inline-end: 1px solid ${token.colorBorder};
  `,
  desc: css`
    line-height: 1.4;
    color: ${token.colorTextDescription};
  `,
  header: css`
    padding: 0 0.75rem;
  `,
  logo: css`
    fill: ${token.colorText};
  `,
  title: css`
    margin: 0;
    font-size: 26px;
    font-weight: 600;
    line-height: 1.3;
  `,
}));

const SidebarLayout = ({ children }: PropsWithChildren) => {
  const { styles } = useStyles();
  const { t } = useTranslation('setting');
  return (
    <Flexbox className={styles.container} flex={'none'} gap={20} width={280}>
      <Flexbox className={styles.header} gap={'0.125rem'}>
        <h1 className={styles.title}>{t('header.title')}</h1>
        <p className={styles.desc}>{t('header.desc')}</p>
      </Flexbox>
      {children}
      <BrandWatermark paddingInline={12} />
    </Flexbox>
  );
};

export default SidebarLayout;
