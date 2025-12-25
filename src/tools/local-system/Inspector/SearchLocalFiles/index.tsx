'use client';

import { LocalFileSearchState } from '@lobechat/builtin-tool-local-system';
import { LocalSearchFilesParams } from '@lobechat/electron-client-ipc';
import { BuiltinInspectorProps } from '@lobechat/types';
import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ChevronRight } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { shinyTextStylish } from '@/styles/loading';

const useStyles = createStyles(({ css, token }) => ({
  content: css`
    font-family: ${token.fontFamilyCode};
  `,
  root: css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;

    color: ${token.colorTextDescription};
  `,
  shinyText: shinyTextStylish(token),
}));

export const SearchLocalFilesInspector = memo<
  BuiltinInspectorProps<LocalSearchFilesParams, LocalFileSearchState>
>(({ args, isLoading }) => {
  const { t } = useTranslation('plugin');
  const { styles, cx } = useStyles();

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
