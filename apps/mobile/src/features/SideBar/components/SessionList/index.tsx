import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, TextInput, View, Text } from 'react-native';

import { useSessionStore } from '@/store/session';
import { useStyles } from './style';

import Inbox from './Inbox';
import SessionItem from './SessionItem';
import { useGlobalStore } from '@/store/global';
import { useAuth } from '@/store/user';

export default function SideBar() {
  const { t } = useTranslation(['chat']);
  const [searchText, setSearchText] = useState('');
  const { sessions } = useSessionStore();
  const { styles, token } = useStyles();

  const [drawerOpen] = useGlobalStore((s) => [s.drawerOpen]);
  const { useFetchSessions } = useSessionStore();
  const { isAuthenticated } = useAuth();
  useFetchSessions(drawerOpen, isAuthenticated);
  // useEffect(() => {
  //   if (drawerOpen) mutate();
  // }, [drawerOpen]);

  const filteredSessions =
    sessions?.filter(
      (session) =>
        session.meta.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        session.meta.description?.toLowerCase().includes(searchText.toLowerCase()),
    ) || [];

  return (
    <View style={styles.container}>
      {/* 搜索栏 */}
      <TextInput
        onChangeText={setSearchText}
        placeholder={t('session.search.placeholder', { ns: 'chat' })}
        placeholderTextColor={token.colorTextPlaceholder}
        style={styles.searchInput}
        value={searchText}
      />

      {/* 会话列表 */}
      <ScrollView style={styles.sessionList}>
        <Inbox />
        <View style={styles.header}>
          <Text style={styles.headerText}>默认列表</Text>
        </View>
        {filteredSessions.map((session) => (
          <SessionItem id={session.id} key={session.id} />
        ))}
      </ScrollView>
    </View>
  );
}
