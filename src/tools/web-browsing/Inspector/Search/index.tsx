'use client';

import { type BuiltinInspectorProps, type SearchQuery } from '@lobechat/types';
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

export const SearchInspector = memo<BuiltinInspectorProps<SearchQuery>>(({ args, isLoading }) => {
  const { t } = useTranslation('plugin');

  const query = args?.query || '';

  // When loading, show "联网搜索 > 搜索页面"
  if (isLoading) {
    return (
      <div className={cx(styles.root, styles.shinyText)}>
        <span>{t('builtins.lobe-web-browsing.title')}</span>
        <Icon icon={ChevronRight} style={{ marginInline: 4 }} />
        <span>{t('builtins.lobe-web-browsing.apiName.search')}</span>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <span>{t('builtins.lobe-web-browsing.apiName.search')}</span>
      {query && (
        <>
          <Icon icon={ChevronRight} style={{ marginInline: 4 }} />
          <span className={styles.content}>{query}</span>
        </>
      )}
    </div>
  );
});

SearchInspector.displayName = 'SearchInspector';

export default SearchInspector;
