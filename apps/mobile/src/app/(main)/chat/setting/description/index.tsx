import { Button, Flexbox, PageContainer, TextArea } from '@lobehub/ui-rn';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { loading } from '@/libs/loading';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/slices/session/selectors';

export default function DescriptionSetting() {
  const { t } = useTranslation('chat');
  const defaultDescription = useSessionStore(sessionMetaSelectors.currentAgentDescription);
  const updateSessionMeta = useSessionStore((s) => s.updateSessionMeta);
  const [description, setDescription] = useState(defaultDescription || '');

  const handleSave = async () => {
    await loading.start(
      (async () => {
        await updateSessionMeta({ description });
      })(),
    );
    router.back();
  };

  return (
    <PageContainer
      extra={
        <Button onPress={handleSave} size={'small'} type={'primary'}>
          {t('setting.done')}
        </Button>
      }
      showBack
      title={t('setting.description')}
    >
      <Flexbox padding={16}>
        <TextArea
          autoFocus
          defaultValue={defaultDescription || ''}
          onChangeText={setDescription}
          value={description || ''}
        />
      </Flexbox>
    </PageContainer>
  );
}
