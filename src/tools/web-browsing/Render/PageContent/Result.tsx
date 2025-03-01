'use client';

import { CrawlSuccessResult } from '@lobechat/web-crawler';
import { Icon } from '@lobehub/ui';
import { Descriptions, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { WebBrowsingManifest } from '@/tools/web-browsing';

const { Text, Paragraph } = Typography;

const useStyles = createStyles(({ token, css }) => {
  return {
    cardBody: css`
      padding-block: 12px 8px;
padding-inline: 16px;
    `,
    container: css`
      cursor: pointer;

      overflow: hidden;

      max-width: 360px;
      border: 1px solid ${token.colorBorderSecondary};
      border-radius: 12px;

      transition: border-color 0.2s;

      :hover {
        border-color: ${token.colorPrimary};
      }
    `,
    description: css`
      margin-block: 0 4px !important;
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
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;

      margin-block-end: 0;
    `,
    titleRow: css`
      color: ${token.colorText};
    `,
  };
});

interface CrawlerData {
  crawler: string;
  messageId: string;
  originalUrl: string;
  result: CrawlSuccessResult;
}

const CrawlerResultCard = memo<CrawlerData>(({ result, messageId, crawler, originalUrl }) => {
  const { styles } = useStyles();
  const [openToolUI] = useChatStore((s) => [s.openToolUI]);

  const { url, title, description } = result;

  return (
    <div
      className={styles.container}
      onClick={() => {
        openToolUI(messageId, WebBrowsingManifest.identifier);
      }}
    >
      <Flexbox className={styles.cardBody} gap={8}>
        <Flexbox align={'center'} className={styles.titleRow} horizontal justify={'space-between'}>
          <Flexbox>
            <div className={styles.title}>{title || originalUrl}</div>
          </Flexbox>
          <Link href={url} onClick={(e) => e.stopPropagation()} target={'_blank'}>
            <Center>
              <Icon icon={ExternalLink} />
            </Center>
          </Link>
        </Flexbox>
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
