'use client';

import type { BuiltinInspectorProps } from '@lobechat/types';
import { createStyles } from 'antd-style';
import { rgba } from 'polished';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = createStyles(({ css, token }) => ({
  root: css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;

    color: ${token.colorTextDescription};
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
}));

export const GetPageContentInspector = memo<BuiltinInspectorProps>(({ isArgumentsStreaming }) => {
  const { t } = useTranslation('plugin');
  const { styles, cx } = useStyles();

  return (
    <div className={cx(styles.root, isArgumentsStreaming && styles.shinyText)}>
      <span>{t('builtins.lobe-page-agent.apiName.getPageContent')}</span>
    </div>
  );
});

GetPageContentInspector.displayName = 'GetPageContentInspector';

export default GetPageContentInspector;
