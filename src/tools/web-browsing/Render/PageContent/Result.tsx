'use client';

import { CrawlSuccessResult } from '@lobechat/web-crawler';
import { Icon } from '@lobehub/ui';
import { Descriptions, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

const { Text, Paragraph } = Typography;

const useStyles = createStyles(({ token, css }) => {
  return {
    cardBody: css`
      padding: ${token.padding}px;
      padding-block-end: 0;
    `,
    container: css`
      max-width: 360px;
      border: 1px solid ${token.colorBorderSecondary};
      border-radius: 12px;
    `,
    description: css`
      margin-block: 0;
      margin-block-start: ${token.marginSM}px;
      color: ${token.colorTextTertiary};
    `,
    detailsSection: css`
      padding-block: ${token.paddingSM}px;
    `,
    externalLink: css`
      color: ${token.colorPrimary};
    `,
    footer: css`
      padding: ${token.paddingXS}px;
      text-align: center;
      background-color: ${token.colorFillQuaternary};
    `,
    footerText: css`
      font-size: ${token.fontSizeSM}px;
      color: ${token.colorTextTertiary} !important;
    `,
    metaInfo: css`
      display: flex;
      align-items: center;
      color: ${token.colorTextSecondary};
    `,
    title: css`
      margin-block-end: 0;
    `,
    titleRow: css`
      color: ${token.colorText};
    `,
  };
});

interface CrawlerData {
  crawler: string;
  originalUrl: string;
  result: CrawlSuccessResult;
}

const CrawlerResultCard = memo<CrawlerData>(({ result, crawler, originalUrl }) => {
  const { styles } = useStyles();

  const { url, title, description } = result;

  return (
    <div className={styles.container}>
      <Flexbox className={styles.cardBody} gap={8}>
        <Link href={url} target={'_blank'}>
          <Flexbox
            align={'center'}
            className={styles.titleRow}
            horizontal
            justify={'space-between'}
          >
            <Flexbox>
              <Text className={styles.title} ellipsis={{ tooltip: title }}>
                {title || originalUrl}
              </Text>
            </Flexbox>
            <Center>
              <Icon icon={ExternalLink} />
            </Center>
          </Flexbox>
        </Link>
        {result.siteName && (
          <div className={styles.metaInfo}>
            <Text style={{ fontSize: '12px' }} type="secondary">
              {result.siteName}
            </Text>
          </div>
        )}
        <Paragraph className={styles.description} ellipsis={{ expandable: false, rows: 2 }}>
          {description || result.content?.slice(0, 40)}
        </Paragraph>
      </Flexbox>

      <div className={styles.footer}>
        <Descriptions
          classNames={{
            content: styles.footerText,
          }}
          column={2}
          items={[
            {
              children: result.content?.length,
              label: '字符数',
            },
            {
              children: crawler,
              label: '抓取类型',
            },
          ]}
          size="small"
        />
      </div>
    </div>
  );
});

export default CrawlerResultCard;
