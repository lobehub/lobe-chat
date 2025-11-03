import { Button, Flexbox, Input, PageContainer, Toast } from '@lobehub/ui-rn';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSessionStore } from '@/store/session';

export default function GroupRenamePage() {
  const { t } = useTranslation('chat');
  const params = useLocalSearchParams<{ id: string; name: string }>();
  const updateSessionGroupName = useSessionStore((s) => s.updateSessionGroupName);
  const [name, setName] = useState(params.name || '');
  const [loading, setLoading] = useState(false);

  return (
    <PageContainer
      extra={
        <Button
          loading={loading}
          onPress={async () => {
            if (name.trim().length === 0 || name.trim().length > 20) {
              Toast.error(t('sessionGroup.tooLong'));
              return;
            }
            setLoading(true);
            try {
              await updateSessionGroupName(params.id, name.trim());
              Toast.success(t('sessionGroup.renameSuccess'));
              router.back();
            } catch {
              Toast.error(t('error', { ns: 'common' }));
            } finally {
              setLoading(false);
            }
          }}
          size="small"
          type="primary"
        >
          {t('setting.done')}
        </Button>
      }
      showBack
      title={t('sessionGroup.rename')}
    >
      <Flexbox padding={16}>
        <Input
          autoFocus
          defaultValue={params.name || ''}
          onChangeText={setName}
          placeholder={t('sessionGroup.inputPlaceholder')}
          value={name}
        />
      </Flexbox>
    </PageContainer>
  );
}
