import { Alert, Icon, Markdown } from '@lobehub/ui';
import { Descriptions, Divider, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import { CrawlResult } from '@/types/tool/crawler';

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
      border-radius: 4px;
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

      font-size: 16px;
      font-weight: bold;
    `,
    titleRow: css`
      color: ${token.colorText};
    `,
  };
});

interface PageContentProps {
  messageId: string;
  result?: CrawlResult;
}

const PageContent = memo<PageContentProps>(({ result }) => {
  const { styles } = useStyles();
  console.log(result);

  if (!result) return undefined;

  const { url, title, description, content } = result.data;
  return (
    <div>
      <Flexbox gap={8}>
        <Link href={url} onClick={(e) => e.stopPropagation()} target={'_blank'}>
          <Flexbox
            align={'center'}
            className={styles.titleRow}
            horizontal
            justify={'space-between'}
          >
            <Flexbox>
              <div className={styles.title}>{title || result.originalUrl}</div>
            </Flexbox>
            <Center>
              <Icon icon={ExternalLink} />
            </Center>
          </Flexbox>
        </Link>

        {description && (
          <Typography.Paragraph
            className={styles.description}
            ellipsis={{ expandable: false, rows: 2 }}
          >
            {description}
          </Typography.Paragraph>
        )}

        {result.originalUrl}

        <div className={styles.footer}>
          <Descriptions
            classNames={{
              content: styles.footerText,
            }}
            column={2}
            items={[
              {
                children: result.data.content?.length,
                label: '字符数',
              },
              {
                children: result.crawler,
                label: '抓取类型',
              },
            ]}
            size="small"
          />
        </div>
      </Flexbox>
      <Divider style={{ margin: '12px 0' }} />

      {content && (
        <>
          {content.length > 5000 && (
            <Alert
              message={
                '文本内容过长，对话上下文将仅保留 5000 字符，超过部分不计入会话上下文，可在此查看'
              }
              variant={'pure'}
            />
          )}
          <Markdown
            // components={{
            //   h1: () => null,
            // }}
            variant={'chat'}
          >
            {content}
          </Markdown>
        </>
      )}
    </div>
  );
});

export default PageContent;
