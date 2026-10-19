import { Button, Flexbox } from '@lobehub/ui';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useCreateAgent } from '../../useCreateAgent';

const AddButton = ({
  groupId,
  visibility,
}: {
  groupId?: string;
  visibility?: 'private' | 'public';
}) => {
  const { t } = useTranslation('chat');
  const { create, loading } = useCreateAgent();
  return (
    <Flexbox flex={1} padding={16}>
      <Button
        block
        icon={Plus}
        loading={loading}
        style={{ marginTop: 8 }}
        type={'fill'}
        onClick={() => create({ groupId, visibility })}
      >
        {t('newAgent')}
      </Button>
    </Flexbox>
  );
};
export default AddButton;
