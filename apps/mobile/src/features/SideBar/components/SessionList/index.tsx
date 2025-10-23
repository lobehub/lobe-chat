import type { LobeAgentSession } from '@lobechat/types';
import {
  Dropdown,
  type DropdownOptionItem,
  FlashListScrollShadow,
  Flexbox,
  Input,
  Toast,
} from '@lobehub/ui-rn';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, InteractionManager } from 'react-native';

import { loading } from '@/libs/loading';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { useAuth } from '@/store/user';

import AddButton from './features/AddButton';
import Inbox from './features/Inbox';
import SessionItem from './features/SessionItem';
import { SessionListSkeleton } from './features/SkeletonList';

export default function SideBar() {
  const { t } = useTranslation('chat');
  const [searchText, setSearchText] = useState('');
  const { sessions } = useSessionStore();
  const toggleDrawer = useGlobalStore((s) => s.toggleDrawer);

  const { useFetchSessions, removeSession, pinSession } = useSessionStore();
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

    // 筛选会话（仅保留 LobeAgentSession）
    let filtered = (
      !keyword
        ? sessions
        : sessions.filter((session) => {
            const title = session.meta.title?.toLowerCase() || '';
            const description = session.meta.description?.toLowerCase() || '';
            return title.includes(keyword) || description.includes(keyword);
          })
    ) as LobeAgentSession[];

    // 排序：优先 pinned，然后按 updatedAt（兜底 createdAt）
    return [...filtered].sort((a, b) => {
      // 1. 优先 pinned 的会话
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }

      // 2. 按 updatedAt 排序（最新的在前），兜底使用 createdAt
      const aTime = a.updatedAt || a.createdAt;
      const bTime = b.updatedAt || b.createdAt;

      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  }, [keyword, sessions]);

  // 构建 FlashList 数据源：包含 inbox 和 sessions
  type ListItem =
    | { data: LobeAgentSession; type: 'session' }
    | { type: 'addButton' }
    | { type: 'inbox' };

  const listData = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [];

    // 添加 inbox
    if (shouldShowInbox) {
      items.push({ type: 'inbox' });
    }

    // 添加会话列表或添加按钮
    if (filteredSessions.length === 0) {
      items.push({ type: 'addButton' });
    } else {
      filteredSessions.forEach((session) => {
        items.push({ data: session, type: 'session' });
      });
    }

    return items;
  }, [shouldShowInbox, filteredSessions]);

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'inbox') {
      return <Inbox />;
    }

    if (item.type === 'addButton') {
      return <AddButton />;
    }

    // session item
    const session = item.data;
    const options: DropdownOptionItem[] = [
      {
        icon: {
          name: session.pinned ? 'pin.slash' : 'pin',
          pointSize: 18,
        },
        key: 'pin',
        onSelect: () => {
          pinSession(session.id, !session.pinned);
        },
        title: t(session.pinned ? 'pinOff' : 'pin', { ns: 'chat' }),
      },
      {
        destructive: true,
        icon: {
          name: 'trash',
          pointSize: 18,
        },
        key: 'delete',
        onSelect: () => {
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
        },
        title: t('actions.delete', { ns: 'common' }),
      },
    ];

    return (
      <Dropdown options={options}>
        <SessionItem {...(session as any)} />
      </Dropdown>
    );
  };

  const getItemType = (item: ListItem) => {
    return item.type;
  };

  if (isLoading) {
    return <SessionListSkeleton />;
  }

  return (
    <Flexbox flex={1} gap={8}>
      {/* 搜索栏 */}
      <Flexbox paddingBlock={8} paddingInline={12}>
        <Input.Search
          glass
          onChangeText={setSearchText}
          placeholder={t('session.search.placeholder', { ns: 'chat' })}
          value={searchText}
          variant="filled"
        />
      </Flexbox>

      {/* 会话列表 */}
      <FlashListScrollShadow
        data={listData}
        estimatedItemSize={72}
        getItemType={getItemType}
        hideScrollBar
        keyExtractor={(item, index) => {
          if (item.type === 'session') {
            return item.data.id;
          }
          return `${item.type}-${index}`;
        }}
        renderItem={renderItem}
        size={2}
      />
    </Flexbox>
  );
}
