'use client';

import { CopyButton } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { createStyles } from 'antd-style';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { lineEllipsis } from '@/styles';
import { shinyTextStylish } from '@/styles/loading';

const useStyles = createStyles(({ token, css, cx }) => {
  return {
    cardBody: css`
      padding-block-start: 12px;
      padding-inline: 12px;
    `,
    container: css`
      overflow: hidden;
      justify-content: space-between;

      min-width: 360px;
      max-width: 360px;
      height: 136px;
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
    text: cx(lineEllipsis(2), shinyTextStylish(token)),
  };
});

const LoadingCard = memo<{ url: string }>(({ url }) => {
  const { t } = useTranslation('plugin');
  const { styles } = useStyles();

  return (
    <Flexbox className={styles.container}>
      <Flexbox className={styles.cardBody} horizontal justify={'space-between'}>
        <Link href={url} rel={'nofollow'} target={'_blank'}>
          <div className={styles.text}>{url}</div>
        </Link>
        <CopyButton content={url} size={'small'} />
      </Flexbox>
      <Flexbox gap={4} paddingInline={16}>
        <Skeleton.Node active style={{ height: 14, width: '95%' }} />
        <Skeleton.Node active style={{ height: 14, width: '40%' }} />
      </Flexbox>

      <div className={styles.footer}>{t('search.crawPages.crawling')}</div>
    </Flexbox>
  );
});

export default LoadingCard;
