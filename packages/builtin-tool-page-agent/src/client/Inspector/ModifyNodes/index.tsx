'use client';

import type { BuiltinInspectorProps } from '@lobechat/types';
import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { DiffIcon, Minus, Plus } from 'lucide-react';
import { rgba } from 'polished';
import { type ReactNode, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { ModifyNodesArgs, ModifyNodesState } from '../../../types';

const useStyles = createStyles(({ css, token }) => ({
  insert: css`
    font-family: ${token.fontFamilyCode};
    color: ${token.colorSuccess};
  `,
  modify: css`
    font-family: ${token.fontFamilyCode};
    color: ${token.colorWarning};
  `,
  remove: css`
    font-family: ${token.fontFamilyCode};
    color: ${token.colorError};
  `,
  root: css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  `,
  separator: css`
    margin-inline: 2px;
    color: ${token.colorTextQuaternary};
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

export const ModifyNodesInspector = memo<BuiltinInspectorProps<ModifyNodesArgs, ModifyNodesState>>(
  ({ args, partialArgs, isArgumentsStreaming }) => {
    const { t } = useTranslation('plugin');
    const { styles, cx } = useStyles();

    // Count operations by type
    const counts = useMemo(() => {
      const operations = args?.operations || partialArgs?.operations || [];
      return operations.reduce(
        (acc, op) => {
          switch (op.action) {
            case 'insert': {
              acc.insert++;
              break;
            }
            case 'modify': {
              acc.modify++;
              break;
            }
            case 'remove': {
              {
                acc.remove++;
                // No default
              }
              break;
            }
          }
          return acc;
        },
        { insert: 0, modify: 0, remove: 0 },
      );
    }, [args?.operations, partialArgs?.operations]);

    const hasOperations = counts.insert > 0 || counts.modify > 0 || counts.remove > 0;

    // During streaming without operations yet, show init message
    if (isArgumentsStreaming && !hasOperations) {
      return (
        <div className={cx(styles.root, styles.shinyText)}>
          <span>{t('builtins.lobe-page-agent.apiName.modifyNodes.init')}</span>
        </div>
      );
    }

    // Build stats parts with colors and icons
    const statsParts: ReactNode[] = [];
    if (counts.insert > 0) {
      statsParts.push(
        <span className={styles.insert} key="insert">
          <Icon icon={Plus} size={12} />
          {counts.insert}
        </span>,
      );
    }
    if (counts.modify > 0) {
      statsParts.push(
        <span className={styles.modify} key="modify">
          <Icon icon={DiffIcon} size={12} />
          {counts.modify}
        </span>,
      );
    }
    if (counts.remove > 0) {
      statsParts.push(
        <span className={styles.remove} key="remove">
          <Icon icon={Minus} size={12} />
          {counts.remove}
        </span>,
      );
    }

    return (
      <div className={cx(styles.root, isArgumentsStreaming && styles.shinyText)}>
        <span className={styles.title}>{t('builtins.lobe-page-agent.apiName.modifyNodes')}</span>
        {statsParts.length > 0 && (
          <>
            {' '}
            {statsParts.map((part, index) => (
              <span key={index}>
                {index > 0 && <span className={styles.separator}> / </span>}
                {part}
              </span>
            ))}
          </>
        )}
      </div>
    );
  },
);

ModifyNodesInspector.displayName = 'ModifyNodesInspector';

export default ModifyNodesInspector;
