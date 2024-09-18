'use client';

import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { CSSProperties, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useInterceptingRoutes } from '@/hooks/useInterceptingRoutes';

const useStyles = createStyles(({ css, token }) => {
  return {
    back: css`
      color: ${token.colorTextDescription};

      &:hover {
        color: ${token.colorText};
      }
    `,
  };
});

const Back = memo<{ href: string; style?: CSSProperties }>(({ href, style }) => {
  const { isIntercepted } = useInterceptingRoutes();
  const { t } = useTranslation('discover');
  const { styles } = useStyles();

  if (isIntercepted) return null;

  return (
    <Link className={styles.back} href={href} style={{ marginBottom: 8, ...style }}>
      <Flexbox align={'center'} gap={8} horizontal>
        <Icon icon={ArrowLeft} />
        {t(`back`)}
      </Flexbox>
    </Link>
  );
});

export default Back;
