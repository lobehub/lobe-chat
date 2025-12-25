'use client';

import type { BuiltinInspectorProps } from '@lobechat/types';
import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ArrowRight } from 'lucide-react';
import { rgba } from 'polished';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import type { ReplaceTextArgs, ReplaceTextState } from '../../../types';

const useStyles = createStyles(({ css, token }) => ({
  arrow: css`
    margin-inline: 4px;
    color: ${token.colorTextQuaternary};
  `,
  from: css`
    color: ${token.colorTextSecondary};
    text-decoration: line-through;
  `,
  highlight: css`
    padding-block-end: 1px;
    color: ${token.colorText};
    background: linear-gradient(to top, ${token.gold3} 40%, transparent 40%);
  `,
  root: css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;

    color: ${token.colorTextSecondary};
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
  stats: css`
    font-family: ${token.fontFamilyCode};
    color: ${token.colorTextSecondary};
  `,
  title: css`
    margin-inline-end: 8px;
    color: ${token.colorText};
  `,
}));

export const ReplaceTextInspector = memo<BuiltinInspectorProps<ReplaceTextArgs, ReplaceTextState>>(
  ({ args, partialArgs, isArgumentsStreaming, pluginState }) => {
    const { t } = useTranslation('plugin');
    const { styles, cx } = useStyles();

    const from = args?.searchText || partialArgs?.searchText;
    const to = args?.newText ?? partialArgs?.newText;

    // During streaming without searchText yet, show init message
    if (isArgumentsStreaming && !from) {
      return (
        <div className={cx(styles.root, styles.shinyText)}>
          <span>{t('builtins.lobe-page-agent.apiName.replaceText.init')}</span>
        </div>
      );
    }

    const count = pluginState?.replacementCount ?? 0;
    const hasResult = from && to !== undefined;

    return (
      <div className={cx(styles.root, isArgumentsStreaming && styles.shinyText)}>
        <span className={styles.title}>{t('builtins.lobe-page-agent.apiName.replaceText')}</span>
        {hasResult && (
          <>
            <span className={styles.from}>{from}</span>
            <Icon className={styles.arrow} icon={ArrowRight} size={12} />
            <span className={styles.highlight}>
              {to || t('builtins.lobe-page-agent.apiName.replaceText.empty')}
            </span>
            {count > 0 && (
              <span className={styles.stats}>
                {' '}
                ({t('builtins.lobe-page-agent.apiName.replaceText.count', { count })})
              </span>
            )}
          </>
        )}
      </div>
    );
  },
);

ReplaceTextInspector.displayName = 'ReplaceTextInspector';

export default ReplaceTextInspector;
