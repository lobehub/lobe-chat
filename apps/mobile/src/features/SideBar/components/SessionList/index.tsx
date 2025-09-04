import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View, Text, Alert } from 'react-native';

import { useSessionStore } from '@/store/session';
import { useStyles } from './style';

import Inbox from './Inbox';
import SessionItem from './SessionItem';
import { useAuth } from '@/store/user';
import { SessionListSkeleton } from './components/SkeletonList';
import * as ContextMenu from 'zeego/context-menu';
import { Toast, TextInput } from '@/components';
import { useGlobalStore } from '@/store/global';

export default function SideBar() {
  const { t } = useTranslation('chat');
  const [searchText, setSearchText] = useState('');
  const { sessions } = useSessionStore();
  const { styles } = useStyles();
  const toggleDrawer = useGlobalStore((s) => s.toggleDrawer);

  const { useFetchSessions, removeSession } = useSessionStore();
  const { isAuthenticated } = useAuth();
  const { isLoading } = useFetchSessions(isAuthenticated, isAuthenticated);

  const filteredSessions =
    sessions?.filter(
      (session) =>
        session.meta.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        session.meta.description?.toLowerCase().includes(searchText.toLowerCase()),
    ) || [];

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SessionListSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 搜索栏 */}
      <TextInput
        onChangeText={setSearchText}
        placeholder={t('session.search.placeholder', { ns: 'chat' })}
        value={searchText}
      />

      {/* 会话列表 */}
      <ScrollView style={styles.sessionList}>
        <Inbox />
        <View style={styles.header}>
          <Text style={styles.headerText}>{t('defaultList', { ns: 'chat' })}</Text>
        </View>
        {filteredSessions.map((session) => (
          <ContextMenu.Root key={session.id}>
            <ContextMenu.Trigger>
              <SessionItem id={session.id} key={session.id} />
            </ContextMenu.Trigger>
            <ContextMenu.Content>
              <ContextMenu.Item
                destructive
                key={session.id}
                onSelect={() => {
                  Alert.alert(t('confirmRemoveSessionItemAlert', { ns: 'chat' }), '', [
                    {
                      style: 'cancel',
                      text: t('actions.cancel', { ns: 'common' }),
                    },
                    {
                      onPress: () => {
                        removeSession(session.id).then(() => {
                          Toast.success(t('status.success', { ns: 'common' }));
                          toggleDrawer();
                        });
                      },
                      style: 'destructive',
                      text: t('actions.confirm', { ns: 'common' }),
                    },
                  ]);
                }}
              >
                <ContextMenu.ItemTitle>
                  {t('actions.delete', { ns: 'common' })}
                </ContextMenu.ItemTitle>
                <ContextMenu.ItemIcon
                  ios={{
                    name: 'trash',
                    pointSize: 18,
                  }}
                />
              </ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu.Root>
        ))}
      </ScrollView>
    </View>
  );
}
