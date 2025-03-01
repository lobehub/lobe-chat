'use client';

import { CopyButton } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';
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
  const { styles } = useStyles();

  return (
    <div className={styles.container}>
      <Flexbox className={styles.cardBody} horizontal>
        <div className={styles.shining}>{url}</div>
        <CopyButton content={url} size={'small'} />
      </Flexbox>
      <div className={styles.footer}>链接识别中</div>
    </div>
  );
});

export default LoadingCard;
