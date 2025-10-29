import type { LobeAgentSession } from '@lobechat/types';
import {
  Dropdown,
  type DropdownOptionItem,
  FlashListScrollShadow,
  Flexbox,
  Toast,
  useTheme,
} from '@lobehub/ui-rn';
import { Button } from '@lobehub/ui-rn';
import { useRouter } from 'expo-router';
import { SearchIcon } from 'lucide-react-native';
import { useMemo } from 'react';
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
  const theme = useTheme();
  const { t } = useTranslation('chat');
  const router = useRouter();
  const { sessions } = useSessionStore();
  const toggleDrawer = useGlobalStore((s) => s.toggleDrawer);

  const { useFetchSessions, removeSession, pinSession } = useSessionStore();
  const { isAuthenticated } = useAuth();
  const { isLoading } = useFetchSessions(isAuthenticated, isAuthenticated);

  const sortedSessions = useMemo(() => {
    if (!sessions) return [];

    // 排序：优先 pinned，然后按 updatedAt（兜底 createdAt）
    return [...(sessions as LobeAgentSession[])].sort((a, b) => {
      // 1. 优先 pinned 的会话
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }

      // 2. 按 updatedAt 排序（最新的在前），兜底使用 createdAt
      const aTime = a.updatedAt || a.createdAt;
      const bTime = b.updatedAt || b.createdAt;

      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  }, [sessions]);

  // 构建 FlashList 数据源：包含 inbox、sessions 和 addButton
  type ListItem =
    | { data: LobeAgentSession; type: 'session' }
    | { type: 'addButton' }
    | { type: 'inbox' };

  const listData = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [];

    // 添加 inbox
    items.push({ type: 'inbox' });

    // 添加会话列表或添加按钮
    if (sortedSessions.length === 0) {
      items.push({ type: 'addButton' });
    } else {
      sortedSessions.forEach((session) => {
        items.push({ data: session, type: 'session' });
      });
    }

    return items;
  }, [sortedSessions]);

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

  return (
    <Flexbox flex={1} gap={8}>
      {/* 搜索栏 */}
      <Flexbox paddingInline={12}>
        <Button
          icon={SearchIcon}
          iconProps={{
            color: theme.colorTextDescription,
          }}
          onPress={() => router.push('/session/search')}
          size={'small'}
          textStyle={{
            color: theme.colorTextDescription,
          }}
          variant="filled"
        >
          {t('session.search.title')}
        </Button>
      </Flexbox>
      {/* 会话列表 */}
      {isLoading ? (
        <SessionListSkeleton />
      ) : (
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
      )}
    </Flexbox>
  );
}
