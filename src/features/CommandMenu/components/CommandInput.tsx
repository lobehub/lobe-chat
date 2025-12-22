import { Tag } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Command } from 'cmdk';
import { ArrowLeft, X } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import type { Context } from '../types';
import type { ValidSearchType } from '../utils/queryParser';

const useStyles = createStyles(({ css, token }) => ({
  backTag: css`
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  `,
  contextTag: css`
    cursor: default;
    user-select: none;
  `,
  contextWrapper: css`
    display: flex;
    gap: 8px;
    padding-block: 12px 6px;
    padding-inline: 16px;
  `,
  inputWrapper: css`
    display: flex;
    gap: 8px;
    align-items: center;

    padding: 16px;
    border-block-end: 1px solid ${token.colorBorderSecondary};
  `,
}));

interface CommandInputProps {
  context?: Context;
  hasPages: boolean;
  isAiMode: boolean;
  onBack: () => void;
  onClearTypeFilter?: () => void;
  onValueChange: (value: string) => void;
  search: string;
  typeFilter?: ValidSearchType;
}

const CommandInput = memo<CommandInputProps>(
  ({
    context,
    hasPages,
    isAiMode,
    onBack,
    onClearTypeFilter,
    onValueChange,
    search,
    typeFilter,
  }) => {
    const { t } = useTranslation('common');
    const { t: tSetting } = useTranslation('setting');
    const { t: tChat } = useTranslation('chat');
    const { styles } = useStyles();

    // Get localized context name
    const getContextName = () => {
      if (!context) return undefined;

      switch (context.type) {
        case 'settings': {
          return tSetting('header.title', { defaultValue: context.name });
        }
        case 'agent': {
          return t('cmdk.search.agent', { defaultValue: context.name });
        }
        case 'group': {
          return tChat('group.title', { defaultValue: context.name });
        }
        case 'page': {
          return t('cmdk.pages', { defaultValue: context.name });
        }
        case 'painting': {
          return t('cmdk.painting', { defaultValue: context.name });
        }
        case 'resource': {
          return t('cmdk.resource', { defaultValue: context.name });
        }
        default: {
          return context.name;
        }
      }
    };

    const contextName = getContextName();

    const getTypeLabel = (type: ValidSearchType) => {
      return t(`cmdk.search.${type}`);
    };

    return (
      <>
        {(context || typeFilter) && !hasPages && (
          <div className={styles.contextWrapper}>
            {context && <Tag className={styles.contextTag}>{contextName}</Tag>}
            {typeFilter && (
              <Tag className={styles.backTag} icon={<X size={12} />} onClick={onClearTypeFilter}>
                {getTypeLabel(typeFilter)}
              </Tag>
            )}
          </div>
        )}
        <div className={styles.inputWrapper}>
          {hasPages && (
            <Tag className={styles.backTag} icon={<ArrowLeft size={12} />} onClick={onBack} />
          )}
          <Command.Input
            autoFocus
            onValueChange={onValueChange}
            placeholder={isAiMode ? t('cmdk.aiModePlaceholder') : t('cmdk.searchPlaceholder')}
            value={search}
          />
          {!isAiMode && search.trim() ? (
            <>
              <span style={{ fontSize: '14px', opacity: 0.6 }}>Ask AI</span>
              <Tag>Tab</Tag>
            </>
          ) : (
            <Tag>ESC</Tag>
          )}
        </div>
      </>
    );
  },
);

CommandInput.displayName = 'CommandInput';

export default CommandInput;
