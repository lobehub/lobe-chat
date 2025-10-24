import { Button, Flexbox, PageContainer, TextArea } from '@lobehub/ui-rn';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/slices/session/selectors';

export default function DescriptionSetting() {
  const { t } = useTranslation('chat');
  const [loading, setLoading] = useState(false);
  const defaultDescription = useSessionStore(sessionMetaSelectors.currentAgentDescription);
  const updateSessionMeta = useSessionStore((s) => s.updateSessionMeta);
  const [description, setDescription] = useState(defaultDescription || '');
  return (
    <PageContainer
      extra={
        <Button
          loading={loading}
          onPress={async () => {
            setLoading(true);
            await updateSessionMeta({ description });
            setLoading(false);
            router.back();
          }}
          size={'small'}
          type={'primary'}
        >
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
