import { Avatar, Button, Center, Flexbox, PageContainer } from '@lobehub/ui-rn';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import SettingGroup from '@/features/SettingGroup';
import SettingItem from '@/features/SettingItem';
import { safeReplaceLogin } from '@/navigation/safeLogin';
import { useAuth, useAuthActions } from '@/store/_user';
import { handleLoginError } from '@/utils/error';

export default function AccountScreen() {
  const { t } = useTranslation(['setting', 'auth', 'error', 'common']);
  const { user, isAuthenticated, isLoading } = useAuth();
  const { logout, switchAccount } = useAuthActions();

  const router = useRouter();

  const handleSwitchAccount = () => {
    if (!isAuthenticated) return;

    Alert.alert(
      t('actions.confirm', { ns: 'common' }),
      t('account.switchAccount.confirm', { ns: 'setting' }),
      [
        {
          style: 'cancel',
          text: t('actions.cancel', { ns: 'common' }),
        },
        {
          onPress: async () => {
            try {
              await switchAccount();
              setTimeout(() => router.replace('/chat'), 0);
            } catch (error) {
              handleLoginError(error, t);
            }
          },
          text: t('account.switchAccount.action', { ns: 'setting' }),
        },
      ],
      { cancelable: true },
    );
  };

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
      <Flexbox flex={1} justify={'space-between'}>
        {isAuthenticated && user && (
          <>
            <Flexbox gap={32} paddingInline={16} style={{ paddingTop: 24 }}>
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

            {/* Account Actions */}
            <Flexbox gap={12} padding={16}>
              <Button
                block
                disabled={isLoading}
                loading={isLoading}
                onPress={handleSwitchAccount}
                variant={'outlined'}
              >
                {t('account.switchAccount.label', { ns: 'setting' })}
              </Button>
              <Button
                block
                danger
                disabled={isLoading}
                loading={isLoading}
                onPress={handleSignOut}
                variant={'filled'}
              >
                {t('account.signOut.label', { ns: 'setting' })}
              </Button>
            </Flexbox>
          </>
        )}
      </Flexbox>
    </PageContainer>
  );
}
