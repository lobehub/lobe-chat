'use client';

import { type BuiltinInspectorProps } from '@lobechat/types';
import { Icon } from '@lobehub/ui';
import { createStaticStyles, cx } from 'antd-style';
import { ChevronRight } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const styles = createStaticStyles(({ css, cssVar }) => ({
  content: css`
    font-family: ${cssVar.fontFamilyCode};
  `,
  root: css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;

    color: ${cssVar.colorTextDescription};
  `,
  shinyText: css`
    color: color-mix(in srgb, ${cssVar.colorText} 45%, transparent);

    background: linear-gradient(
      120deg,
      color-mix(in srgb, ${cssVar.colorTextBase} 0%, transparent) 40%,
      ${cssVar.colorTextSecondary} 50%,
      color-mix(in srgb, ${cssVar.colorTextBase} 0%, transparent) 60%
    );
    background-clip: text;
    background-size: 200% 100%;

    animation: shine 1.5s linear infinite;

    @keyframes shine {
      0% {
        background-position: 100%;
      }

      100% {
        background-position: -100%;
      }
    }
  `,
}));

interface CrawlMultiPagesParams {
  urls: string[];
}

export const CrawlMultiPagesInspector = memo<BuiltinInspectorProps<CrawlMultiPagesParams>>(
  ({ args, isLoading }) => {
    const { t } = useTranslation('plugin');

    // Show count and first domain for context
    let displayText = '';
    if (args?.urls && args.urls.length > 0) {
      const count = args.urls.length;
      try {
        const firstUrl = new URL(args.urls[0]);
        displayText = count > 1 ? `${firstUrl.hostname} +${count - 1}` : firstUrl.hostname;
      } catch {
        displayText = `${count} pages`;
      }
    }

    // When loading, show "联网搜索 > 读取多个页面内容"
    if (isLoading) {
      return (
        <div className={cx(styles.root, styles.shinyText)}>
          <span>{t('builtins.lobe-web-browsing.title')}</span>
          <Icon icon={ChevronRight} style={{ marginInline: 4 }} />
          <span>{t('builtins.lobe-web-browsing.apiName.crawlMultiPages')}</span>
        </div>
      );
    }

    return (
      <div className={styles.root}>
        <span>{t('builtins.lobe-web-browsing.apiName.crawlMultiPages')}</span>
        {displayText && (
          <>
            <Icon icon={ChevronRight} style={{ marginInline: 4 }} />
            <span className={styles.content}>{displayText}</span>
          </>
        )}
      </div>
    );
  },
);

CrawlMultiPagesInspector.displayName = 'CrawlMultiPagesInspector';

export default CrawlMultiPagesInspector;
