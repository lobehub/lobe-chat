'use client';

import type { LocalReadFileState } from '@lobechat/builtin-tool-local-system';
import { type LocalReadFileParams } from '@lobechat/electron-client-ipc';
import { type BuiltinInspectorProps } from '@lobechat/types';
import { Icon } from '@lobehub/ui';
import { createStaticStyles, cx } from 'antd-style';
import { ChevronRight } from 'lucide-react';
import path from 'path-browserify-esm';
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

export const ReadLocalFileInspector = memo<
  BuiltinInspectorProps<LocalReadFileParams, LocalReadFileState>
>(({ args, isLoading }) => {
  const { t } = useTranslation('plugin');

  // Show filename with parent directory for context
  let displayPath = '';
  if (args?.path) {
    const { base, dir } = path.parse(args.path);
    const parentDir = path.basename(dir);
    displayPath = parentDir ? `${parentDir}/${base}` : base;
  }

  return (
    <div className={cx(styles.root, isLoading && styles.shinyText)}>
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
