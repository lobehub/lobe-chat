import { Tag } from '@lobehub/ui';
import { Command } from 'cmdk';
import { ArrowLeft } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

interface CommandInputProps {
  hasPages: boolean;
  isAiMode: boolean;
  onBack: () => void;
  onValueChange: (value: string) => void;
  search: string;
  styles: {
    backTag: string;
    inputWrapper: string;
  };
}

const CommandInput = memo<CommandInputProps>(
  ({ hasPages, isAiMode, onBack, onValueChange, search, styles }) => {
    const { t } = useTranslation('common');

    return (
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
    );
  },
);

CommandInput.displayName = 'CommandInput';

export default CommandInput;
