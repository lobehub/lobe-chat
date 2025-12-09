'use client';

import { CrawlErrorResult, CrawlSuccessResult } from '@lobechat/web-crawler';
import { Alert, Icon, Text } from '@lobehub/ui';
import { Descriptions } from 'antd';
import { createStyles } from 'antd-style';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { WebBrowsingManifest } from '@/tools/web-browsing';

const useStyles = createStyles(({ token, css }) => {
  return {
    cardBody: css`
      padding-block: 12px 8px;
      padding-inline: 16px;
    `,
    container: css`
      cursor: pointer;

      overflow: hidden;

      min-width: 360px;
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
      color: ${token.colorTextQuaternary};

      :hover {
        color: ${token.colorText};
      }
    `,
    footer: css`
      padding-block: 8px;
      padding-inline: 16px;
      border-radius: 8px;

      text-align: center;

      background-color: ${token.colorFillQuaternary};
    `,
    footerText: css`
      font-size: 12px !important;
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
  result: CrawlSuccessResult | CrawlErrorResult;
}

const CrawlerResultCard = memo<CrawlerData>(({ result, messageId, crawler, originalUrl }) => {
  const { t } = useTranslation('plugin');
  const { styles } = useStyles();
  const [openToolUI, togglePageContent] = useChatStore((s) => [s.openToolUI, s.togglePageContent]);

  if ('errorType' in result) {
    return (
      <Flexbox className={styles.footer} gap={8}>
        <Alert
          message={
            <div style={{ textAlign: 'start' }}>{result.errorMessage || result.content}</div>
          }
          type={'error'}
          variant={'borderless'}
        />
        <div>
          <Descriptions
            classNames={{
              content: styles.footerText,
              label: styles.footerText,
            }}
            column={1}
            items={[
              {
                children: crawler,
                label: t('search.crawPages.meta.crawler'),
              },
            ]}
            size="small"
          />
        </div>
      </Flexbox>
    );
  }

  const { url, title, description } = result as CrawlSuccessResult;

  return (
    <Flexbox
      className={styles.container}
      justify={'space-between'}
      onClick={() => {
        openToolUI(messageId, WebBrowsingManifest.identifier);
        togglePageContent(originalUrl);
      }}
    >
      <Flexbox className={styles.cardBody} gap={8}>
        <Flexbox align={'center'} className={styles.titleRow} horizontal justify={'space-between'}>
          <Flexbox>
            <div className={styles.title}>{title || originalUrl}</div>
          </Flexbox>
          <Link href={url} onClick={(e) => e.stopPropagation()} target={'_blank'}>
            <Center className={styles.externalLink}>
              <Icon icon={ExternalLink} />
            </Center>
          </Link>
        </Flexbox>
        <Text className={styles.description} ellipsis={{ rows: 2 }}>
          {description || result.content?.slice(0, 40)}
        </Text>
      </Flexbox>
      <div className={styles.footer}>
        <Descriptions
          classNames={{
            content: styles.footerText,
            label: styles.footerText,
          }}
          column={2}
          items={[
            {
              children: result.content?.length,
              label: t('search.crawPages.meta.words'),
            },
            {
              children: crawler,
              label: t('search.crawPages.meta.crawler'),
            },
          ]}
          size="small"
        />
      </div>
    </Flexbox>
  );
});

export default CrawlerResultCard;
