'use client';

import { EditLocalFileState } from '@lobechat/builtin-tool-local-system';
import { EditLocalFileParams } from '@lobechat/electron-client-ipc';
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

export const EditLocalFileInspector = memo<
  BuiltinInspectorProps<EditLocalFileParams, EditLocalFileState>
>(({ args, isLoading }) => {
  const { t } = useTranslation('plugin');
  const { styles, cx } = useStyles();

  // Show filename with parent directory for context
  let displayPath = '';
  if (args?.file_path) {
    const { base, dir } = path.parse(args.file_path);
    const parentDir = path.basename(dir);
    displayPath = parentDir ? `${parentDir}/${base}` : base;
  }

  return (
    <div className={cx(styles.root, isLoading && styles.shinyText)}>
      <span>{t('builtins.lobe-local-system.title')}</span>
      <Icon icon={ChevronRight} style={{ marginInline: 4 }} />
      <span>{t('builtins.lobe-local-system.apiName.editLocalFile')}</span>
      {displayPath && (
        <>
          <Icon icon={ChevronRight} style={{ marginInline: 4 }} />
          <span className={styles.content}>{displayPath}</span>
        </>
      )}
    </div>
  );
});

EditLocalFileInspector.displayName = 'EditLocalFileInspector';
