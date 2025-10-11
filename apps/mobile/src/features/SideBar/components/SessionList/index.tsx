import { Input, Toast } from '@lobehub/ui-rn';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, InteractionManager, ScrollView, View } from 'react-native';
import * as ContextMenu from 'zeego/context-menu';

import { loading } from '@/libs/loading';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { useAuth } from '@/store/user';

import Inbox from './Inbox';
import SessionItem from './SessionItem';
import { SessionListSkeleton } from './components/SkeletonList';
import { useStyles } from './style';

export default function SideBar() {
  const { t } = useTranslation('chat');
  const [searchText, setSearchText] = useState('');
  const { sessions } = useSessionStore();
  const { styles } = useStyles();
  const toggleDrawer = useGlobalStore((s) => s.toggleDrawer);

  const { useFetchSessions, removeSession } = useSessionStore();
  const { isAuthenticated } = useAuth();
  const { isLoading } = useFetchSessions(isAuthenticated, isAuthenticated);

  const keyword = searchText.trim().toLowerCase();
  const inboxTitle = t('inbox.title', { ns: 'chat' });
  const inboxDescription = t('inbox.desc', { ns: 'chat' });

  const shouldShowInbox = useMemo(() => {
    if (!keyword) return true;

    return (
      inboxTitle.toLowerCase().includes(keyword) || inboxDescription.toLowerCase().includes(keyword)
    );
  }, [inboxDescription, inboxTitle, keyword]);

  const filteredSessions = useMemo(() => {
    if (!sessions) return [];
    if (!keyword) return sessions;

    return sessions.filter((session) => {
      const title = session.meta.title?.toLowerCase() || '';
      const description = session.meta.description?.toLowerCase() || '';

      return title.includes(keyword) || description.includes(keyword);
    });
  }, [keyword, sessions]);

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
      <Input.Search
        onChangeText={setSearchText}
        placeholder={t('session.search.placeholder', { ns: 'chat' })}
        size="large"
        style={styles.searchInput}
        value={searchText}
        variant="filled"
      />

      {/* 会话列表 */}
      <ScrollView style={styles.sessionList}>
        {shouldShowInbox && <Inbox />}
        {/* Group 功能现在没上，暂时不需要 */}
        {/* <View style={styles.header}>
          <Text style={styles.headerText}>{t('agentList', { ns: 'chat' })}</Text>
        </View> */}
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
                        const { done } = loading.start();
                        removeSession(session.id).then(() => {
                          Toast.success(t('status.success', { ns: 'common' }));
                          InteractionManager.runAfterInteractions(() => {
                            toggleDrawer();
                            done();
                          });
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
