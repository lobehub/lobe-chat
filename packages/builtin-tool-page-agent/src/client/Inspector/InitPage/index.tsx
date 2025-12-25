'use client';

import type { BuiltinInspectorProps } from '@lobechat/types';
import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Plus } from 'lucide-react';
import { rgba } from 'polished';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import type { InitDocumentArgs, InitDocumentState } from '../../../types';
import { AnimatedNumber } from '../../components/AnimatedNumber';

const useStyles = createStyles(({ css, token }) => ({
  chars: css`
    font-family: ${token.fontFamilyCode};
    color: ${token.colorTextDescription};
  `,
  lines: css`
    font-family: ${token.fontFamilyCode};
    color: ${token.colorSuccess};
  `,
  root: css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  `,
  shinyText: css`
    color: ${rgba(token.colorText, 0.45)};

    background: linear-gradient(
      120deg,
      ${rgba(token.colorTextBase, 0)} 40%,
      ${token.colorTextSecondary} 50%,
      ${rgba(token.colorTextBase, 0)} 60%
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
  title: css`
    margin-inline-end: 8px;
    color: ${token.colorText};
  `,
}));

export const InitPageInspector = memo<BuiltinInspectorProps<InitDocumentArgs, InitDocumentState>>(
  ({ args, partialArgs, isArgumentsStreaming, pluginState }) => {
    const { t } = useTranslation('plugin');
    const { styles, cx } = useStyles();

    // Calculate lines and chars from markdown content
    const markdown = args?.markdown || partialArgs?.markdown || '';
    const lines = markdown ? markdown.split('\n').length : 0;
    const chars = markdown.length;

    // If we have state, use nodeCount as lines indicator
    const displayLines = pluginState?.nodeCount || lines;
    const hasContent = displayLines > 0 || chars > 0;

    // During streaming without content, show init
    if (isArgumentsStreaming && !hasContent) {
      return (
        <div className={cx(styles.root, styles.shinyText)}>
          <span>{t('builtins.lobe-page-agent.apiName.initPage')}</span>
        </div>
      );
    }

    return (
      <div className={cx(styles.root, isArgumentsStreaming && styles.shinyText)}>
        <span className={styles.title}>
          {t('builtins.lobe-page-agent.apiName.initPage.result')}
        </span>
        {displayLines > 0 && (
          <span className={styles.lines}>
            <Icon icon={Plus} size={12} />
            <AnimatedNumber value={displayLines} />
            {t('builtins.lobe-page-agent.apiName.initPage.lines')}
          </span>
        )}
        {chars > 0 && (
          <span className={styles.chars}>
            {' '}
            <AnimatedNumber value={chars} />
            {t('builtins.lobe-page-agent.apiName.initPage.chars')}
          </span>
        )}
      </div>
    );
  },
);

InitPageInspector.displayName = 'InitPageInspector';

export default InitPageInspector;
