'use client';

import { CopyButton } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { shinyTextStylish } from '@/styles/loading';

const useStyles = createStyles(({ token, css }) => {
  return {
    cardBody: css`
      padding-block: 12px 8px;
      padding-inline: 12px;
    `,
    container: css`
      overflow: hidden;
      justify-content: space-between;

      max-width: 360px;
      border: 1px solid ${token.colorBorderSecondary};
      border-radius: 12px;
    `,

    footer: css`
      padding-block: 8px;
      padding-inline: 12px;

      font-size: ${token.fontSizeSM}px;
      color: ${token.colorTextTertiary};

      background-color: ${token.colorFillQuaternary};
    `,
    shining: shinyTextStylish(token),
  };
});

const LoadingCard = memo<{ url: string }>(({ url }) => {
  const { t } = useTranslation('plugin');
  const { styles } = useStyles();

  return (
    <Flexbox className={styles.container}>
      <Flexbox className={styles.cardBody} horizontal>
        <Link href={url} rel={'nofollow'} target={'_blank'}>
          <div className={styles.shining}>{url}</div>
        </Link>
        <CopyButton content={url} size={'small'} />
      </Flexbox>
      <div className={styles.footer}>{t('search.crawPages.crawling')}</div>
    </Flexbox>
  );
});

export default LoadingCard;
