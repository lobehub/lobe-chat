import { Tag } from '@lobehub/ui';
import { Command } from 'cmdk';
import { ArrowLeft } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import type { Context } from '../types';

interface CommandInputProps {
  context?: Context;
  hasPages: boolean;
  isAiMode: boolean;
  onBack: () => void;
  onValueChange: (value: string) => void;
  search: string;
  styles: {
    backTag: string;
    contextTag: string;
    contextWrapper: string;
    inputWrapper: string;
  };
}

const CommandInput = memo<CommandInputProps>(
  ({ context, hasPages, isAiMode, onBack, onValueChange, search, styles }) => {
    const { t } = useTranslation('common');
    const { t: tSetting } = useTranslation('setting');
    const { t: tChat } = useTranslation('chat');

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

    return (
      <>
        {context && !hasPages && (
          <div className={styles.contextWrapper}>
            <Tag className={styles.contextTag}>{contextName}</Tag>
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
