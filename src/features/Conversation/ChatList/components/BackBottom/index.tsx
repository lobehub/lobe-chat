import { ActionIcon } from '@lobehub/ui';
import { ArrowDownIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useStyles } from './style';

export interface BackBottomProps {
  onScrollToBottom: () => void;
  visible: boolean;
}

const BackBottom = memo<BackBottomProps>(({ visible, onScrollToBottom }) => {
  const { styles, cx } = useStyles();

  const { t } = useTranslation('chat');

  return (
    <ActionIcon
      className={cx(styles.container, visible && styles.visible)}
      glass
      icon={ArrowDownIcon}
      onClick={onScrollToBottom}
      size={{
        blockSize: 36,
        borderRadius: 36,
        size: 18,
      }}
      title={t('backToBottom')}
      variant={'outlined'}
    />
  );
});

export default BackBottom;
