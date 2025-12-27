'use client';

import { type LocalFileSearchState } from '@lobechat/builtin-tool-local-system';
import { type LocalSearchFilesParams } from '@lobechat/electron-client-ipc';
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

export const SearchLocalFilesInspector = memo<
  BuiltinInspectorProps<LocalSearchFilesParams, LocalFileSearchState>
>(({ args, isLoading }) => {
  const { t } = useTranslation('plugin');

  const keywords = args?.keywords || '';

  // When loading, show "本地系统 > 搜索文件"
  if (isLoading) {
    return (
      <div className={cx(styles.root, styles.shinyText)}>
        <span>{t('builtins.lobe-local-system.title')}</span>
        <Icon icon={ChevronRight} style={{ marginInline: 4 }} />
        <span>{t('builtins.lobe-local-system.apiName.searchLocalFiles')}</span>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <span>{t('builtins.lobe-local-system.apiName.searchLocalFiles')}</span>
      {keywords && (
        <>
          <Icon icon={ChevronRight} style={{ marginInline: 4 }} />
          <span className={styles.content}>{keywords}</span>
        </>
      )}
    </div>
  );
});

SearchLocalFilesInspector.displayName = 'SearchLocalFilesInspector';
