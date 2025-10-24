import { Button, Flexbox, Input, PageContainer } from '@lobehub/ui-rn';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/slices/session/selectors';

export default function NameSetting() {
  const { t } = useTranslation('chat');
  const [loading, setLoading] = useState(false);
  const defaultTitle = useSessionStore(sessionMetaSelectors.currentAgentTitle);
  const updateSessionMeta = useSessionStore((s) => s.updateSessionMeta);
  const [title, setTitle] = useState(defaultTitle || '');
  return (
    <PageContainer
      extra={
        <Button
          loading={loading}
          onPress={async () => {
            setLoading(true);
            await updateSessionMeta({ title });
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
