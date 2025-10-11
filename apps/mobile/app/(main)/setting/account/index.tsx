import { Avatar, Button, PageContainer } from '@lobehub/ui-rn';
import { useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, View } from 'react-native';

import { safeReplaceLogin } from '@/navigation/safeLogin';
import { useAuth, useAuthActions } from '@/store/user';

import { SettingGroup, SettingItem } from '../(components)';
import { useStyles } from './style';

export default function AccountScreen() {
  const { t } = useTranslation(['setting', 'auth', 'error']);
  const { user, isAuthenticated } = useAuth();
  const { logout } = useAuthActions();
  const { styles } = useStyles();
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
      <View style={styles.container}>
        {isAuthenticated && user && (
          <>
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <Avatar alt={user.name || user.email} avatar={user.avatar} size={80} />
            </View>

            {/* User Information */}
            <SettingGroup>
              <SettingItem
                extra={user.name || user.username || ''}
                title={t('account.profile.name', { ns: 'setting' })}
              />
              <SettingItem
                extra={user.email}
                isLast
                title={t('account.profile.email', { ns: 'setting' })}
              />
            </SettingGroup>

            {/* Logout Section */}
            <View style={styles.signOutSection}>
              <Button block danger onPress={handleSignOut} size="large" type="primary">
                {t('account.signOut.label', { ns: 'setting' })}
              </Button>
            </View>
          </>
        )}
      </View>
    </PageContainer>
  );
}
