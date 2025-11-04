import { Button, Flexbox, Input, PageContainer } from '@lobehub/ui-rn';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { loading } from '@/libs/loading';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/slices/session/selectors';

export default function NameSetting() {
  const { t } = useTranslation('chat');
  const defaultTitle = useSessionStore(sessionMetaSelectors.currentAgentTitle);
  const updateSessionMeta = useSessionStore((s) => s.updateSessionMeta);
  const [title, setTitle] = useState(defaultTitle || '');

  const handleSave = async () => {
    await loading.start(
      (async () => {
        await updateSessionMeta({ title });
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
      title={t('setting.name')}
    >
      <Flexbox padding={16}>
        <Input
          autoFocus
          defaultValue={defaultTitle || ''}
          onChangeText={setTitle}
          value={title || ''}
        />
      </Flexbox>
    </PageContainer>
  );
}
