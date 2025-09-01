import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, TextInput, View, Text } from 'react-native';

import { useSessionStore } from '@/store/session';
import { useStyles } from './style';

import Inbox from './Inbox';
import SessionItem from './SessionItem';
import { useAuth } from '@/store/user';
import { SessionListSkeleton } from './components/SkeletonList';

export default function SideBar() {
  const { t } = useTranslation(['chat']);
  const [searchText, setSearchText] = useState('');
  const { sessions } = useSessionStore();
  const { styles, token } = useStyles();

  const { useFetchSessions } = useSessionStore();
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
        placeholderTextColor={token.colorTextPlaceholder}
        style={styles.searchInput}
        value={searchText}
      />

      {/* 会话列表 */}
      <ScrollView style={styles.sessionList}>
        <Inbox />
        <View style={styles.header}>
          <Text style={styles.headerText}>{t('defaultList', { ns: 'chat' })}</Text>
        </View>
        {filteredSessions.map((session) => (
          <SessionItem id={session.id} key={session.id} />
        ))}
      </ScrollView>
    </View>
  );
}
