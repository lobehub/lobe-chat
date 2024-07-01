'use client';

import { createStyles } from 'antd-style';
import { useTranslation } from 'react-i18next';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

import BrandWatermark from '@/components/BrandWatermark';

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    padding-block: 24px 16px;
    padding-inline: 12px;
    background: ${token.colorBgContainer};
    border-inline-end: 1px solid ${token.colorBorder};
  `,
  desc: css`
    line-height: 1.4;
    color: ${token.colorTextDescription};
  `,
  header: css`
    padding-block: 0;
    padding-inline: 0.75rem;
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

interface SidebarLayoutProps extends FlexboxProps {
  desc?: string;
  title?: string;
}

const SidebarLayout = ({ children, className, title, desc, ...rest }: SidebarLayoutProps) => {
  const { cx, styles } = useStyles();
  const { t } = useTranslation('setting');
  return (
    <Flexbox
      className={cx(styles.container, className)}
      flex={'none'}
      gap={20}
      width={280}
      {...rest}
    >
      <Flexbox className={styles.header} gap={4}>
        <h1 className={styles.title}>{title || t('header.title')}</h1>
        <p className={styles.desc}>{desc || t('header.desc')}</p>
      </Flexbox>
      {children}
      <BrandWatermark paddingInline={12} />
    </Flexbox>
  );
};

export default SidebarLayout;
