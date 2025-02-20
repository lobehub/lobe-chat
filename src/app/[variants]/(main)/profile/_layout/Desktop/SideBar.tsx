'use client';

import { createStyles } from 'antd-style';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

import BrandWatermark from '@/components/BrandWatermark';
import CircleLoading from '@/components/Loading/CircleLoading';
import PanelTitle from '@/components/PanelTitle';

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    padding-block: 0 16px;
    padding-inline: 12px;
    border-inline-end: 1px solid ${token.colorBorder};
    background: ${token.colorBgContainer};
  `,
}));

interface SidebarLayoutProps extends FlexboxProps {
  desc?: string;
  title?: string;
}

const SidebarLayout = ({ children, className, title, desc, ...rest }: SidebarLayoutProps) => {
  const { cx, styles } = useStyles();
  const { t } = useTranslation('auth');
  return (
    <Flexbox
      className={cx(styles.container, className)}
      flex={'none'}
      gap={20}
      width={280}
      {...rest}
    >
      <PanelTitle desc={desc || t('header.desc')} title={title || t('header.title')} />
      <Suspense fallback={<CircleLoading />}>{children}</Suspense>
      <BrandWatermark paddingInline={12} />
    </Flexbox>
  );
};

export default SidebarLayout;
