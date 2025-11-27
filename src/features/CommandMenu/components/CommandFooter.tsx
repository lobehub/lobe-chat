import { ArrowUpDown, CornerDownLeft } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

interface CommandFooterProps {
  isAiMode: boolean;
  search: string;
  styles: {
    commandFooter: string;
    kbd: string;
    kbdIcon: string;
  };
}

const CommandFooter = memo<CommandFooterProps>(({ isAiMode, search, styles }) => {
  const { t } = useTranslation('common');

  return (
    <div className={styles.commandFooter}>
      {search.trim() && !isAiMode && (
        <div className={styles.kbd}>
          <span>Tab</span>
          <span>Ask AI</span>
        </div>
      )}
      <div className={styles.kbd}>
        <CornerDownLeft className={styles.kbdIcon} />
        <span>{t('cmdk.toOpen')}</span>
      </div>
      <div className={styles.kbd}>
        <ArrowUpDown className={styles.kbdIcon} />
        <span>{t('cmdk.toSelect')}</span>
      </div>
    </div>
  );
});

CommandFooter.displayName = 'CommandFooter';

export default CommandFooter;
