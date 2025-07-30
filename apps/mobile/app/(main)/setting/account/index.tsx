import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Stack } from 'expo-router';
import { ListGroup } from '@/components';
import { useAuth, useAuthActions } from '@/store/user';
import Avatar from '@/components/Avatar';
import { SettingItem } from '../(components)/SettingItem';
import { useStyles } from './style';

export default function AccountScreen() {
  const { t } = useTranslation(['setting', 'auth', 'error']);
  const { user, isAuthenticated } = useAuth();
  const { logout } = useAuthActions();
  const { styles } = useStyles();

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
    <>
      <Stack.Screen options={{ title: t('account.title', { ns: 'setting' }) }} />
      <ScrollView style={styles.container}>
        {isAuthenticated && user && (
          <>
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <Avatar alt={user.name || user.email} avatar={user.avatar} size={80} />
            </View>

            {/* User Information */}
            <ListGroup>
              <SettingItem
                extra={user.name || user.username || ''}
                title={t('account.profile.name', { ns: 'setting' })}
              />
              <SettingItem
                extra={user.email}
                title={t('account.profile.email', { ns: 'setting' })}
              />
              <SettingItem
                extra={
                  user.emailVerified
                    ? t('account.profile.verified', { ns: 'setting' })
                    : t('account.profile.unverified', { ns: 'setting' })
                }
                isLast
                title={t('account.profile.status', { ns: 'setting' })}
              />
            </ListGroup>

            {/* Logout Section */}
            <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
              <Text style={styles.signOutButtonText}>
                {t('account.signOut.label', { ns: 'setting' })}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </>
  );
}
