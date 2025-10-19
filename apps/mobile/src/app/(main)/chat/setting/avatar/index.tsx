import { Avatar, Button, Center, EmojiSelector, PageContainer, useTheme } from '@lobehub/ui-rn';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/slices/session/selectors';

export default function AvatarSetting() {
  const { t } = useTranslation(['chat']);
  const [loading, setLoading] = useState(false);
  const defaultAvatar = useSessionStore(sessionMetaSelectors.currentAgentAvatar);
  const updateSessionMeta = useSessionStore((s) => s.updateSessionMeta);
  const [avatar, setAvatar] = useState<string>(defaultAvatar || '🤖');

  const theme = useTheme();

  return (
    <PageContainer
      extra={
        <Button
          loading={loading}
          onPress={async () => {
            setLoading(true);
            await updateSessionMeta({ avatar });
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
      title={t('setting.avatar')}
    >
      <Center padding={16}>
        <Center
          padding={8}
          style={{
            borderColor: theme.colorFillTertiary,
            borderRadius: 36,
            borderWidth: 2,
          }}
        >
          <Avatar animation avatar={avatar} size={80} />
        </Center>
      </Center>
      <EmojiSelector onChange={setAvatar} />
    </PageContainer>
  );
}
