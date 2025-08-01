import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, TextInput, View } from 'react-native';

import { useSessionStore } from '@/store/session';
import { useStyles } from './styles';

import Inbox from './components/Inbox';
import Header from './components/Header';
import SessionItem from './components/SessionItem';
import Footer from './components/Footer';

export default function SideBar() {
  const { t } = useTranslation(['chat']);
  const [searchText, setSearchText] = useState('');
  const { sessions, fetchSessions } = useSessionStore();
  const { styles, token } = useStyles();

  useEffect(() => {
    fetchSessions();
  }, []);

  const filteredSessions =
    sessions?.filter(
      (session) =>
        session.meta.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        session.meta.description?.toLowerCase().includes(searchText.toLowerCase()),
    ) || [];

  return (
    <View style={styles.container}>
      <Header />

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

        {filteredSessions.map((session) => (
          <SessionItem id={session.id} key={session.id} />
        ))}
      </ScrollView>

      <Footer />
    </View>
  );
}
