'use client';

import type { LocalReadFileState } from '@lobechat/builtin-tool-local-system';
import { LocalReadFileParams } from '@lobechat/electron-client-ipc';
import { BuiltinInspectorProps } from '@lobechat/types';
import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ChevronRight } from 'lucide-react';
import path from 'path-browserify-esm';
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

export const ReadLocalFileInspector = memo<
  BuiltinInspectorProps<LocalReadFileParams, LocalReadFileState>
>(({ args, isLoading }) => {
  const { t } = useTranslation('plugin');
  const { styles, cx } = useStyles();

  // Show filename with parent directory for context
  let displayPath = '';
  if (args?.path) {
    const { base, dir } = path.parse(args.path);
    const parentDir = path.basename(dir);
    displayPath = parentDir ? `${parentDir}/${base}` : base;
  }

  return (
    <div className={cx(styles.root, isLoading && styles.shinyText)}>
      <span>{t('builtins.lobe-local-system.title')}</span>
      <Icon icon={ChevronRight} style={{ marginInline: 4 }} />
      <span>{t('builtins.lobe-local-system.apiName.readLocalFile')}</span>
      {displayPath && (
        <>
          <Icon icon={ChevronRight} style={{ marginInline: 4 }} />
          <span className={styles.content}>{displayPath}</span>
        </>
      )}
    </div>
  );
});

ReadLocalFileInspector.displayName = 'ReadLocalFileInspector';
