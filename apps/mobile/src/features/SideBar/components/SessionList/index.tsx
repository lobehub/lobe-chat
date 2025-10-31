import type { LobeAgentSession, LobeSession } from '@lobechat/types';
import { SessionDefaultGroup } from '@lobechat/types';
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
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, InteractionManager } from 'react-native';

import { loading } from '@/libs/loading';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { useAuth } from '@/store/user';

import AddButton from './features/AddButton';
import Inbox from './features/Inbox';
import SessionGroupHeader from './features/SessionGroupHeader';
import SessionItem from './features/SessionItem';
import { SessionListSkeleton } from './features/SkeletonList';

// 将 SessionItem 用 Dropdown 包裹的组件
const SessionItemWithDropdown = memo<{
  groupId?: string;
  isPinned: boolean;
  onDelete: () => void;
  onPin: () => void;
  session: LobeAgentSession;
}>(({ session, onPin, onDelete, groupId, isPinned }) => {
  const { t } = useTranslation('chat');
  const router = useRouter();

  const options: DropdownOptionItem[] = useMemo(() => {
    return [
      {
        icon: {
          name: isPinned ? 'pin.slash' : 'pin',
          pointSize: 18,
        },
        key: 'pin',
        onSelect: onPin,
        title: t(isPinned ? 'pinOff' : 'pin'),
      },
      // 移动到分组 - 跳转到新页面
      {
        icon: {
          name: 'folder',
          pointSize: 18,
        },
        key: 'moveToGroup',
        onSelect: () => {
          router.push({
            params: {
              currentGroupId: groupId || SessionDefaultGroup.Default,
              isPinned: String(isPinned),
              sessionId: session.id,
            },
            pathname: '/session/group-select',
          });
        },
        title: t('sessionGroup.moveGroup'),
      },
      {
        destructive: true,
        icon: {
          name: 'trash',
          pointSize: 18,
        },
        key: 'delete',
        onSelect: onDelete,
        title: t('actions.delete', { ns: 'common' }),
      },
    ];
  }, [isPinned, onPin, onDelete, groupId, session.id, router, t]);

  return (
    <Dropdown options={options}>
      <SessionItem {...(session as any)} />
    </Dropdown>
  );
});

SessionItemWithDropdown.displayName = 'SessionItemWithDropdown';

// SessionGroupHeader 的包装组件，避免每次渲染都创建新的 onPress 函数
const MemoizedGroupHeader = memo<{
  count: number;
  groupId: string;
  isCustomGroup?: boolean;
  isExpanded: boolean;
  onToggle: (groupId: string) => void;
  title: string;
}>(({ groupId, title, count, isExpanded, onToggle, isCustomGroup }) => {
  const handlePress = useCallback(() => {
    onToggle(groupId);
  }, [groupId, onToggle]);

  return (
    <SessionGroupHeader
      count={count}
      groupId={isCustomGroup ? groupId : undefined}
      isExpanded={isExpanded}
      onPress={handlePress}
      title={title}
    />
  );
});

MemoizedGroupHeader.displayName = 'MemoizedGroupHeader';

export default function SideBar() {
  const theme = useTheme();
  const { t } = useTranslation('chat');
  const router = useRouter();
  const toggleDrawer = useGlobalStore((s) => s.toggleDrawer);

  const { useFetchSessions, removeSession, pinSession } = useSessionStore();
  const { isAuthenticated } = useAuth();
  const { isLoading } = useFetchSessions(isAuthenticated, isAuthenticated);

  // 获取分组数据
  const pinnedSessions = useSessionStore(sessionSelectors.pinnedSessions);
  const customSessionGroups = useSessionStore(sessionSelectors.customSessionGroups);
  const defaultSessions = useSessionStore(sessionSelectors.defaultSessions);

  // 获取分组展开状态
  const [sessionGroupKeys, setSessionGroupKeys] = useGlobalStore((s) => [
    s.sessionGroupKeys,
    s.setSessionGroupKeys,
  ]);

  // 切换分组展开/折叠
  const toggleGroupExpand = useCallback(
    (groupId: string) => {
      if (sessionGroupKeys.includes(groupId)) {
        setSessionGroupKeys(sessionGroupKeys.filter((key) => key !== groupId));
      } else {
        setSessionGroupKeys([...sessionGroupKeys, groupId]);
      }
    },
    [sessionGroupKeys, setSessionGroupKeys],
  );

  // 构建 FlashList 数据源：包含 inbox、分组头部、sessions 和 addButton
  // 重要：始终包含所有项，通过高度=0来隐藏折叠的项，避免数据源变化导致重新渲染
  type ListItem =
    | { data: LobeSession; groupId?: string; type: 'session' }
    | {
        count: number;
        groupId: string;
        isCustomGroup?: boolean;
        title: string;
        type: 'groupHeader';
      }
    | { groupId: string; type: 'emptyGroup' }
    | { type: 'addButton' }
    | { type: 'inbox' };

  const listData = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [];

    // 添加 inbox
    items.push({ type: 'inbox' });

    const hasAnySession =
      pinnedSessions.length > 0 ||
      (customSessionGroups && customSessionGroups.length > 0) ||
      defaultSessions.length > 0;

    if (!hasAnySession) {
      items.push({ type: 'addButton' });
      return items;
    }

    // 添加 Pinned 分组 - 始终添加所有项
    if (pinnedSessions.length > 0) {
      const groupId = 'pinned';
      items.push({
        count: pinnedSessions.length,
        groupId,
        title: t('pin'),
        type: 'groupHeader',
      });
      // 始终添加所有 session，不管是否展开
      pinnedSessions.forEach((session) => {
        items.push({ data: session, groupId, type: 'session' });
      });
    }

    // 添加自定义分组 - 始终添加所有项
    if (customSessionGroups) {
      customSessionGroups.forEach((group) => {
        items.push({
          count: group.children.length,
          groupId: group.id,
          isCustomGroup: true,
          title: group.name,
          type: 'groupHeader',
        });

        if (group.children.length === 0) {
          // 如果分组为空，添加空状态（新建按钮）
          items.push({ groupId: group.id, type: 'emptyGroup' });
        } else {
          // 始终添加所有 session，不管是否展开
          group.children.forEach((session) => {
            items.push({ data: session, groupId: group.id, type: 'session' });
          });
        }
      });
    }

    // 添加 Default 分组 - 始终添加
    const groupId = 'default';
    items.push({
      count: defaultSessions.length,
      groupId,
      title: t('defaultList'),
      type: 'groupHeader',
    });

    if (defaultSessions.length === 0) {
      // 如果分组为空，添加空状态（新建按钮）
      items.push({ groupId, type: 'emptyGroup' });
    } else {
      // 始终添加所有 session，不管是否展开
      defaultSessions.forEach((session) => {
        items.push({ data: session, groupId, type: 'session' });
      });
    }

    return items;
  }, [pinnedSessions, customSessionGroups, defaultSessions, t]);

  // 处理 pin/unpin
  const handlePinSession = useCallback(
    (sessionId: string, pinned: boolean) => {
      pinSession(sessionId, !pinned);
    },
    [pinSession],
  );

  // 处理删除
  const handleDeleteSession = useCallback(
    (sessionId: string) => {
      Alert.alert(t('confirmRemoveSessionItemAlert'), '', [
        {
          style: 'cancel',
          text: t('actions.cancel', { ns: 'common' }),
        },
        {
          onPress: () => {
            const { done } = loading.start();
            removeSession(sessionId).then(() => {
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
    [t, removeSession, toggleDrawer],
  );

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === 'inbox') {
        return <Inbox />;
      }

      if (item.type === 'addButton') {
        return <AddButton />;
      }

      if (item.type === 'groupHeader') {
        return (
          <MemoizedGroupHeader
            count={item.count}
            groupId={item.groupId}
            isCustomGroup={item.isCustomGroup}
            isExpanded={sessionGroupKeys.includes(item.groupId)}
            onToggle={toggleGroupExpand}
            title={item.title}
          />
        );
      }

      if (item.type === 'emptyGroup') {
        // 空分组状态：显示新建助手按钮
        const isExpanded = sessionGroupKeys.includes(item.groupId);
        if (!isExpanded) {
          return null;
        }
        return <AddButton groupId={item.groupId} />;
      }

      // session item
      const session = item.data;
      // 检查该 session 所属的分组是否展开
      const isExpanded = item.groupId ? sessionGroupKeys.includes(item.groupId) : true;

      if (!isExpanded) {
        // 折叠状态：返回空组件
        return null;
      }

      return (
        <SessionItemWithDropdown
          groupId={item.groupId}
          isPinned={!!session.pinned}
          onDelete={() => handleDeleteSession(session.id)}
          onPin={() => handlePinSession(session.id, !!session.pinned)}
          session={session as LobeAgentSession}
        />
      );
    },
    [sessionGroupKeys, toggleGroupExpand, handlePinSession, handleDeleteSession],
  );

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
          drawDistance={400}
          estimatedItemSize={72}
          extraData={sessionGroupKeys}
          getItemType={getItemType}
          hideScrollBar
          keyExtractor={(item, index) => {
            if (item.type === 'session') {
              return item.data.id;
            }
            if (item.type === 'groupHeader') {
              return `group-${item.groupId}`;
            }
            return `${item.type}-${index}`;
          }}
          overrideItemLayout={(layout, item) => {
            // 为不同类型的项目设置精确的高度
            switch (item.type) {
              case 'groupHeader': {
                (layout as any).size = 40;

                break;
              }
              case 'inbox': {
                (layout as any).size = 72;

                break;
              }
              case 'addButton': {
                (layout as any).size = 72;

                break;
              }
              case 'emptyGroup': {
                const isExpanded = sessionGroupKeys.includes(item.groupId);
                (layout as any).size = isExpanded ? 72 : 0;

                break;
              }
              case 'session': {
                // 检查该 session 所属的分组是否展开
                const isExpanded = item.groupId ? sessionGroupKeys.includes(item.groupId) : true;
                (layout as any).size = isExpanded ? 72 : 0;

                break;
              }
              // No default
            }
          }}
          renderItem={renderItem}
          size={2}
        />
      )}
    </Flexbox>
  );
}
