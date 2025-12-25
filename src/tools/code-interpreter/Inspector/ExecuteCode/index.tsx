'use client';

import { type BuiltinInspectorProps } from '@lobechat/types';
import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ChevronRight } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { shinyTextStylish } from '@/styles/loading';

import { type ExecuteCodeState } from '../../type';

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

interface ExecuteCodeParams {
  code: string;
  description: string;
  language?: 'javascript' | 'python' | 'typescript';
}

export const ExecuteCodeInspector = memo<
  BuiltinInspectorProps<ExecuteCodeParams, ExecuteCodeState>
>(({ args, partialArgs, isArgumentsStreaming }) => {
  const { t } = useTranslation('plugin');
  const { styles, cx } = useStyles();

  if (isArgumentsStreaming && !partialArgs?.description)
    return (
      <div className={cx(styles.root, styles.shinyText)}>
        <span>{t('builtins.lobe-cloud-code-interpreter.title')}</span>
        <Icon icon={ChevronRight} style={{ marginInline: 4 }} />
        <span>{t('builtins.lobe-cloud-code-interpreter.apiName.executeCode')}</span>
      </div>
    );

  const displayText = args?.description || partialArgs?.description || '';

  return (
    <div className={cx(styles.root, isArgumentsStreaming && styles.shinyText)}>
      <span>{t('builtins.lobe-cloud-code-interpreter.apiName.executeCode')}</span>
      {displayText && (
        <>
          <Icon icon={ChevronRight} style={{ marginInline: 4 }} />
          <span className={styles.content}>{displayText}</span>
        </>
      )}
    </div>
  );
});

ExecuteCodeInspector.displayName = 'ExecuteCodeInspector';
