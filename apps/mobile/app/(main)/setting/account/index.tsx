import { Avatar, Button, Center, Flexbox, PageContainer } from '@lobehub/ui-rn';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { safeReplaceLogin } from '@/navigation/safeLogin';
import { useAuth, useAuthActions } from '@/store/user';

import { SettingGroup, SettingItem } from '../(components)';

export default function AccountScreen() {
  const { t } = useTranslation(['setting', 'auth', 'error']);
  const { user, isAuthenticated } = useAuth();
  const { logout } = useAuthActions();

  const router = useRouter();

  const handleSignOut = async () => {
    if (!isAuthenticated) {
      return;
    }

    Alert.alert(
      t('actions.confirm', { ns: 'common' }),
      t('account.signOut.confirm', { ns: 'setting' }),
      [
        {
          style: 'cancel',
          text: t('actions.cancel', { ns: 'common' }),
        },
        {
          onPress: async () => {
            try {
              await logout();
              // Ensure we leave the authenticated stack immediately after logout
              safeReplaceLogin(router);
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Logout failed';
              Alert.alert(t('error.title', { ns: 'error' }), errorMessage);
            }
          },
          style: 'destructive',
          text: t('actions.confirm', { ns: 'common' }),
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <PageContainer showBack title={t('account.title', { ns: 'setting' })}>
      <Flexbox flex={1} justify={'space-between'} paddingInline={16}>
        {isAuthenticated && user && (
          <>
            <Flexbox gap={32} style={{ paddingTop: 24 }}>
              <Center>
                <Avatar alt={user.name || user.email} avatar={user.avatar} size={80} />
              </Center>
              <SettingGroup borderRadius={true} variant={'outlined'}>
                <SettingItem
                  extra={user.name || user.username || ''}
                  title={t('account.profile.name', { ns: 'setting' })}
                />
                <SettingItem
                  extra={user.email}
                  title={t('account.profile.email', { ns: 'setting' })}
                />
              </SettingGroup>
            </Flexbox>

            {/* Logout Section */}
            <View>
              <Button block danger onPress={handleSignOut} size="large" type="primary">
                {t('account.signOut.label', { ns: 'setting' })}
              </Button>
            </View>
          </>
        )}
      </Flexbox>
    </PageContainer>
  );
}
