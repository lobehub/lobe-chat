'use client';

import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';

import { OFFICIAL_SITE } from '@/const/url';

const useStyles = createStyles(({ css, token }) => ({
  button: css`
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadiusLG}px;

    &:hover {
      background: ${token.colorFillTertiary};
    }
  `,
  desc: css`
    color: ${token.colorTextSecondary};
  `,
  title: css`
    font-size: 16px;
    font-weight: 500;
  `,
}));

const Pagination = memo(() => {
  const { t } = useTranslation('changelog');
  const { styles } = useStyles();
  return (
    <Flexbox gap={16} horizontal style={{ marginTop: 24 }} width={'100%'}>
      <Link
        href={urlJoin(OFFICIAL_SITE, '/changelog/page/2')}
        style={{ color: 'inherit', flex: 1 }}
        target={'_blank'}
      >
        <Flexbox align={'flex-end'} className={styles.button} gap={4} padding={16}>
          <Flexbox align={'center'} className={styles.desc} gap={4} horizontal>
            {t('pagination.next')}
            <Icon icon={ChevronRightIcon} />
          </Flexbox>
          <div className={styles.title}>{t('pagination.older')}</div>
        </Flexbox>
      </Link>
    </Flexbox>
  );
});

export default Pagination;
