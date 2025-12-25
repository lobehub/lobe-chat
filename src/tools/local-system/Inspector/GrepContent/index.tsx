'use client';

import { GrepContentState } from '@lobechat/builtin-tool-local-system';
import { GrepContentParams } from '@lobechat/electron-client-ipc';
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

export const GrepContentInspector = memo<
  BuiltinInspectorProps<GrepContentParams, GrepContentState>
>(({ args, isLoading }) => {
  const { t } = useTranslation('plugin');
  const { styles, cx } = useStyles();

  const pattern = args?.pattern || '';

  // When loading, show "本地系统 > 搜索内容"
  if (isLoading) {
    return (
      <div className={cx(styles.root, styles.shinyText)}>
        <span>{t('builtins.lobe-local-system.title')}</span>
        <Icon icon={ChevronRight} style={{ marginInline: 4 }} />
        <span>{t('builtins.lobe-local-system.apiName.grepContent')}</span>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <span>{t('builtins.lobe-local-system.apiName.grepContent')}</span>
      {pattern && (
        <>
          <Icon icon={ChevronRight} style={{ marginInline: 4 }} />
          <span className={styles.content}>{pattern}</span>
        </>
      )}
    </div>
  );
});

GrepContentInspector.displayName = 'GrepContentInspector';
