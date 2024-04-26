import { Icon } from '@lobehub/ui';
import { Button } from 'antd';
import { Plus } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useActionSWR } from '@/libs/swr';
import { useSessionStore } from '@/store/session';

const AddButton = memo<{ groupId?: string }>(({ groupId }) => {
  const { t } = useTranslation('chat');
  const createSession = useSessionStore((s) => s.createSession);

  const { mutate, isValidating } = useActionSWR(['session.createSession', groupId], () => {
    return createSession({ group: groupId });
  });

  return (
    <Flexbox style={{ margin: '12px 16px' }}>
      <Button block icon={<Icon icon={Plus} />} loading={isValidating} onClick={() => mutate()}>
        {t('newAgent')}
      </Button>
    </Flexbox>
  );
});

export default AddButton;
