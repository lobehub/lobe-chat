import { Command } from 'cmdk';
import { Image, MessageSquare } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useCommandMenuContext } from './CommandMenuContext';
import { useCommandMenu } from './useCommandMenu';
import { useStyles } from './styles';

const AskAIMenu = memo(() => {
  const { t } = useTranslation('common');
  const { handleAskLobeAI, handleAIPainting } = useCommandMenu();
  const { search } = useCommandMenuContext();
  const { styles } = useStyles();

  const heading = search.trim()
    ? t('cmdk.askAIHeading', { query: `"${search.trim()}"` })
    : t('cmdk.askAIHeadingEmpty');

  return (
    <Command.Group heading={heading}>
      <Command.Item onSelect={handleAskLobeAI} value="ask-lobe-ai">
        <MessageSquare className={styles.icon} />
        <div className={styles.itemContent}>
          <div className={styles.itemLabel}>{t('cmdk.askLobeAI')}</div>
        </div>
      </Command.Item>
      <Command.Item onSelect={handleAIPainting} value="ai-painting">
        <Image className={styles.icon} />
        <div className={styles.itemContent}>
          <div className={styles.itemLabel}>{t('cmdk.aiPainting')}</div>
        </div>
      </Command.Item>
    </Command.Group>
  );
});

AskAIMenu.displayName = 'AskAIMenu';

export default AskAIMenu;
