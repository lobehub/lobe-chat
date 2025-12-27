'use client';

import type { BuiltinInspectorProps } from '@lobechat/types';
import { createStaticStyles, cx } from 'antd-style';
import { memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import type { EditTitleArgs, EditTitleState } from '../../../types';

const styles = createStaticStyles(({ css, cssVar }) => ({
  highlight: css`
    padding-block-end: 1px;
    color: ${cssVar.colorText};
    background: linear-gradient(to top, ${cssVar.gold3} 40%, transparent 40%);
  `,
  root: css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;

    color: ${cssVar.colorTextSecondary};
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

export const EditTitleInspector = memo<BuiltinInspectorProps<EditTitleArgs, EditTitleState>>(
  ({ args, partialArgs, isArgumentsStreaming }) => {
    const { t } = useTranslation('plugin');

    const title = args?.title || partialArgs?.title;

    return (
      <div className={cx(styles.root, isArgumentsStreaming && styles.shinyText)}>
        {title ? (
          <Trans
            components={{ title: <span className={styles.highlight} /> }}
            i18nKey="builtins.lobe-page-agent.apiName.editTitle.result"
            ns="plugin"
            values={{ title }}
          />
        ) : (
          <span>{t('builtins.lobe-page-agent.apiName.editTitle')}</span>
        )}
      </div>
    );
  },
);

EditTitleInspector.displayName = 'EditTitleInspector';

export default EditTitleInspector;
