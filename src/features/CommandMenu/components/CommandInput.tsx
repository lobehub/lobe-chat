import { Tag } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Command } from 'cmdk';
import { ArrowLeft, X } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useCommandMenuContext } from '../CommandMenuContext';
import { useCommandMenu } from '../useCommandMenu';
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

const CommandInput = memo(() => {
  const { t } = useTranslation('common');
  const { t: tSetting } = useTranslation('setting');
  const { t: tChat } = useTranslation('chat');
  const { styles } = useStyles();

  const { handleBack } = useCommandMenu();
  const { menuContext, viewMode, pages, search, setSearch, typeFilter, setTypeFilter } =
    useCommandMenuContext();

  const hasPages = pages.length > 0;

  // Get localized context name
  const getContextName = () => {
    switch (menuContext) {
      case 'settings': {
        return tSetting('header.title', { defaultValue: menuContext });
      }
      case 'agent': {
        return t('cmdk.search.agent', { defaultValue: menuContext });
      }
      case 'group': {
        return tChat('group.title', { defaultValue: menuContext });
      }
      case 'page': {
        return t('cmdk.pages', { defaultValue: menuContext });
      }
      case 'painting': {
        return t('cmdk.painting', { defaultValue: menuContext });
      }
      case 'resource': {
        return t('cmdk.resource', { defaultValue: menuContext });
      }
      default: {
        return menuContext;
      }
    }
  };

  const contextName = getContextName();

  const getTypeLabel = (type: ValidSearchType) => {
    return t(`cmdk.search.${type}`);
  };

  return (
    <>
      {(menuContext !== 'general' || typeFilter) && !hasPages && (
        <div className={styles.contextWrapper}>
          {menuContext !== 'general' && <Tag className={styles.contextTag}>{contextName}</Tag>}
          {typeFilter && (
            <Tag
              className={styles.backTag}
              icon={<X size={12} />}
              onClick={() => setTypeFilter(undefined)}
            >
              {getTypeLabel(typeFilter)}
            </Tag>
          )}
        </div>
      )}
      <div className={styles.inputWrapper}>
        {hasPages && (
          <Tag className={styles.backTag} icon={<ArrowLeft size={12} />} onClick={handleBack} />
        )}
        <Command.Input
          autoFocus
          onValueChange={setSearch}
          placeholder={
            viewMode === 'ai-chat' ? t('cmdk.aiModePlaceholder') : t('cmdk.searchPlaceholder')
          }
          value={search}
        />
        {viewMode !== 'ai-chat' && search.trim() ? (
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
});

CommandInput.displayName = 'CommandInput';

export default CommandInput;
