'use client';

import { RunCommandParams, RunCommandResult } from '@lobechat/electron-client-ipc';
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

interface RunCommandState {
  message: string;
  result: RunCommandResult;
}

export const RunCommandInspector = memo<BuiltinInspectorProps<RunCommandParams, RunCommandState>>(
  ({ args, isLoading }) => {
    const { t } = useTranslation('plugin');
    const { styles, cx } = useStyles();

    // Show description if available, otherwise show command
    const displayText = args?.description || args?.command || '';

    // When loading, show "Local System > 执行命令"
    if (isLoading) {
      return (
        <div className={cx(styles.root, styles.shinyText)}>
          <span>{t('builtins.lobe-local-system.title')}</span>
          <Icon icon={ChevronRight} style={{ marginInline: 4 }} />
          <span>{t('builtins.lobe-local-system.apiName.runCommand')}</span>
        </div>
      );
    }

    return (
      <div className={styles.root}>
        <span>{t('builtins.lobe-local-system.apiName.runCommand')}</span>
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

RunCommandInspector.displayName = 'RunCommandInspector';

export default RunCommandInspector;
