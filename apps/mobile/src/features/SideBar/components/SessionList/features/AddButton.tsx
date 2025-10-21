import { Button } from '@lobehub/ui-rn';
import { Plus } from 'lucide-react-native';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import Flexbox from '@/components/Flexbox';
import { useActionSWR } from '@/libs/swr';
import { useSessionStore } from '@/store/session';

const AddButton = memo(() => {
  const { t } = useTranslation('chat');
  const createSession = useSessionStore((s) => s.createSession);
  const { mutate, isValidating } = useActionSWR(['session.createSession'], () => createSession());

  return (
    <Flexbox flex={1} paddingInline={12}>
      <Button
        block
        icon={Plus}
        loading={isValidating}
        onPress={() => mutate()}
        size={'small'}
        variant={'filled'}
      >
        {t('newAgent')}
      </Button>
    </Flexbox>
  );
});

AddButton.displayName = 'AddButton';

export default AddButton;
