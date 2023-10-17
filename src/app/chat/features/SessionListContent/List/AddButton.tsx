import { Icon } from '@lobehub/ui';
import { Button, type ButtonProps } from 'antd';
import { Plus } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useSessionStore } from '@/store/session';

const AddButton = memo<ButtonProps>((props) => {
  const { t } = useTranslation('chat');
  const createSession = useSessionStore((s) => s.createSession);
  return (
    <Flexbox style={{ margin: '12px 16px' }}>
      <Button block icon={<Icon icon={Plus} />} onClick={() => createSession()} {...props}>
        {t('newAgent')}
      </Button>
    </Flexbox>
  );
});

export default AddButton;
