import { Button, Icon } from '@lobehub/ui';
import { ListEnd, X } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';

import { useStyles } from './style';

export interface BackBottomProps {
  onScrollToBottom: () => void;
  visible: boolean;
}

const BackBottom = memo<BackBottomProps>(({ visible, onScrollToBottom }) => {
  const { styles, cx } = useStyles();

  const { t } = useTranslation(['chat', 'common']);

  const [isMessageSelectionMode, toggleMessageSelectionMode] = useChatStore((s) => [
    s.isMessageSelectionMode,
    s.toggleMessageSelectionMode,
  ]);

  return (
    <Flexbox
      className={cx(styles.container, (visible || isMessageSelectionMode) && styles.visible)}
      gap={8}
    >
      {isMessageSelectionMode && (
        <Button
          className={styles.button}
          icon={<Icon icon={X} />}
          onClick={() => toggleMessageSelectionMode(false)}
          size={'small'}
        >
          {t('exitSelection', { defaultValue: 'Quit Selection', ns: 'common' })}
        </Button>
      )}
      <Button
        className={cx(styles.button, !visible && styles.hide)}
        icon={<Icon icon={ListEnd} />}
        onClick={onScrollToBottom}
        size={'small'}
      >
        {t('backToBottom', { defaultValue: 'Back to bottom' })}
      </Button>
    </Flexbox>
  );
});

export default BackBottom;
