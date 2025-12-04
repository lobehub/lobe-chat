import { Button, Icon } from '@lobehub/ui';
import { ListEnd } from 'lucide-react';
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
    <Button
      className={cx(styles.container, visible && styles.visible)}
      icon={<Icon icon={ListEnd} />}
      onClick={onScrollToBottom}
      size={'small'}
    >
      {t('backToBottom')}
    </Button>
  );
});

export default BackBottom;
