import { Button } from '@lobehub/ui';
import { Plus } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useActionSWR } from '@/libs/swr';
import { useSessionStore } from '@/store/session';

const AddButton = memo<{ groupId?: string }>(({ groupId }) => {
  const { t } = useTranslation('chat');
  const createSession = useSessionStore((s) => s.createSession);

  const { mutate, isValidating } = useActionSWR(['session.createSession', groupId], () => {
    return createSession({ group: groupId });
  });

  return (
    <Button
      block
      icon={Plus}
      loading={isValidating}
      onClick={() => mutate()}
      style={{
        marginTop: 8,
      }}
      variant={'filled'}
    >
      {t('newAgent')}
    </Button>
  );
});

export default AddButton;
