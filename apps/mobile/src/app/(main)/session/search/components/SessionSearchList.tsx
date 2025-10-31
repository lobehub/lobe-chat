import type { DiscoverAssistantItem, LobeAgentSession } from '@lobechat/types';
import {
  Block,
  Cell,
  Center,
  Dropdown,
  type DropdownOptionItem,
  Empty,
  ListItem,
  Toast,
  useTheme,
} from '@lobehub/ui-rn';
import { FlashList } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { forwardRef, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, InteractionManager } from 'react-native';

import AgentCard from '@/features/discover/assistant/components/AgentCard';
import { AgentCardSkeleton } from '@/features/discover/assistant/components/SkeletonList';
import { loading } from '@/libs/loading';
import { useChatStore } from '@/store/chat';
import { useDiscoverStore } from '@/store/discover';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { sessionMetaSelectors } from '@/store/session/selectors';

const INITIAL_PAGE_SIZE = 21;

interface SessionSearchListProps {
  searchText: string;
}

const SessionSearchList = memo(
  forwardRef<any, SessionSearchListProps>(({ searchText }, ref) => {
    const { t } = useTranslation('chat');
    const theme = useTheme();
    const router = useRouter();
    const { sessions, removeSession, pinSession, switchSession } = useSessionStore();
    const switchTopic = useChatStore((s) => s.switchTopic);
    const setDrawerOpen = useGlobalStore((s) => s.setDrawerOpen);

    const keyword = searchText.trim().toLowerCase();

    // 处理会话点击：切换会话并导航回聊天页面
    const handleSessionPress = useCallback(
      (sessionId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

        // 1. 切换会话
        switchSession(sessionId);
        // 2. 清除当前 topic
        switchTopic();
        // 3. 关闭抽屉
        setDrawerOpen(false);
        // 4. 导航回聊天页面
        router.back();
      },
      [switchSession, switchTopic, setDrawerOpen, router],
    );

    // 本地会话搜索
    const filteredSessions = useMemo(() => {
      if (!sessions) return [];

      const filtered = sessions.filter((session) => {
        const title = session.meta.title?.toLowerCase() || '';
        const description = session.meta.description?.toLowerCase() || '';
        return title.includes(keyword) || description.includes(keyword);
      }) as LobeAgentSession[];

      // 排序：优先 pinned，然后按 updatedAt
      return [...filtered].sort((a, b) => {
        if (a.pinned !== b.pinned) {
          return a.pinned ? -1 : 1;
        }
        const aTime = a.updatedAt || a.createdAt;
        const bTime = b.updatedAt || b.createdAt;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });
    }, [keyword, sessions]);

    // Discover 助手搜索
    const [currentPage, setCurrentPage] = useState(1);
    const [allDiscoverItems, setAllDiscoverItems] = useState<DiscoverAssistantItem[]>([]);

    const queryParams = useMemo(
      () => ({
        page: currentPage,
        pageSize: INITIAL_PAGE_SIZE,
        q: keyword || undefined,
      }),
      [keyword, currentPage],
    );

    const useAssistantList = useDiscoverStore((s) => s.useAssistantList);
    const { data: discoverAgents, isLoading: isDiscoverLoading } = useAssistantList(queryParams);

    // 搜索关键词变化时重置状态
    useEffect(() => {
      setCurrentPage(1);
      setAllDiscoverItems([]);
    }, [keyword]);

    // 处理 Discover 数据
    useEffect(() => {
      if (discoverAgents?.items) {
        if (currentPage === 1) {
          setAllDiscoverItems(discoverAgents.items);
        } else {
          setAllDiscoverItems((prev) => [...prev, ...discoverAgents.items]);
        }
      }
    }, [discoverAgents, currentPage]);

    // 动态计算市场助手显示数量
    const discoverItemsLimit = useMemo(() => {
      return filteredSessions.length > 6 ? 3 : 6;
    }, [filteredSessions.length]);

    // 限制显示的市场助手数量
    const displayedDiscoverItems = useMemo(() => {
      return allDiscoverItems.slice(0, discoverItemsLimit);
    }, [allDiscoverItems, discoverItemsLimit]);

    // 是否显示"更多"按钮
    const showMoreButton = useMemo(() => {
      return allDiscoverItems.length > discoverItemsLimit;
    }, [allDiscoverItems.length, discoverItemsLimit]);

    // 跳转到市场搜索页面
    const handleNavigateToMarket = useCallback(() => {
      router.push({
        params: { q: keyword },
        pathname: '/discover/assistant/search',
      });
    }, [router, keyword]);

    // 类型定义
    type ListItem =
      | { data: { showMore: boolean; title: string }; type: 'section-header' }
      | { data: LobeAgentSession; type: 'session' }
      | { data: DiscoverAssistantItem; type: 'discover-agent' }
      | { data: { message: string }; type: 'empty' }
      | { type: 'divider' }
      | { data: { index: number }; type: 'skeleton' };

    const listData = useMemo<ListItem[]>(() => {
      const items: ListItem[] = [];

      // 添加本地会话部分
      if (filteredSessions.length > 0) {
        items.push({
          data: { showMore: false, title: t('session.search.myAssistants') },
          type: 'section-header',
        });
        filteredSessions.forEach((session) => {
          items.push({ data: session, type: 'session' });
        });
      }

      // 如果两个分组都存在，添加分割线
      if (filteredSessions.length > 0 && (displayedDiscoverItems.length > 0 || isDiscoverLoading)) {
        items.push({ type: 'divider' });
      }

      // 添加 Discover 助手部分
      if (isDiscoverLoading && allDiscoverItems.length === 0) {
        // 首次加载：显示骨架屏
        items.push({
          data: { showMore: false, title: t('session.search.discoverAssistants') },
          type: 'section-header',
        });
        // 显示 3 个骨架屏项
        for (let i = 0; i < 3; i++) {
          items.push({ data: { index: i }, type: 'skeleton' });
        }
      } else if (displayedDiscoverItems.length > 0) {
        // 有数据：显示实际内容
        items.push({
          data: { showMore: showMoreButton, title: t('session.search.discoverAssistants') },
          type: 'section-header',
        });
        displayedDiscoverItems.forEach((agent) => {
          items.push({ data: agent, type: 'discover-agent' });
        });
      }

      // 如果两个部分都为空，显示空状态
      if (filteredSessions.length === 0 && allDiscoverItems.length === 0 && !isDiscoverLoading) {
        items.push({
          data: { message: t('session.search.emptyResult') },
          type: 'empty',
        });
      }

      return items;
    }, [
      allDiscoverItems.length,
      displayedDiscoverItems,
      filteredSessions,
      isDiscoverLoading,
      showMoreButton,
      t,
    ]);

    const renderItem = useCallback(
      ({ item }: { item: ListItem }) => {
        // 分组标题
        if (item.type === 'section-header') {
          return (
            <Cell
              arrowIconProps={{
                size: 14,
              }}
              extra={item.data.showMore && t('actions.more', { ns: 'common' })}
              extraProps={{
                color: theme.colorTextDescription,
                fontSize: 14,
              }}
              onPress={item.data.showMore ? handleNavigateToMarket : undefined}
              pressEffect={item.data.showMore}
              showArrow={item.data.showMore}
              title={item.data.title.toUpperCase()}
              titleProps={{
                color: theme.colorTextDescription,
                fontSize: 14,
              }}
            />
          );
        }

        // 分割线
        if (item.type === 'divider') {
          return (
            <Block
              height={8}
              style={{
                backgroundColor: theme.colorFillQuaternary,
              }}
              variant={'filled'}
            />
          );
        }

        // 空状态
        if (item.type === 'empty') {
          return (
            <Center paddingBlock={48}>
              <Empty description={item.data.message} />
            </Center>
          );
        }

        // 骨架屏
        if (item.type === 'skeleton') {
          return <AgentCardSkeleton />;
        }

        // Discover 助手卡片
        if (item.type === 'discover-agent') {
          return <AgentCard item={item.data} />;
        }

        // 本地会话
        const session = item.data;
        const { title, description, avatar } = {
          avatar: sessionMetaSelectors.getAvatar(session.meta),
          description: sessionMetaSelectors.getDescription(session.meta),
          title: sessionMetaSelectors.getTitle(session.meta),
        };

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
            title: t(session.pinned ? 'pinOff' : 'pin'),
          },
          {
            destructive: true,
            icon: {
              name: 'trash',
              pointSize: 18,
            },
            key: 'delete',
            onSelect: () => {
              Alert.alert(t('confirmRemoveSessionItemAlert'), '', [
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
                        setDrawerOpen(false);
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
            <ListItem
              avatar={avatar}
              description={description}
              onPress={() => handleSessionPress(session.id)}
              title={title}
              variant="borderless"
            />
          </Dropdown>
        );
      },
      [
        handleNavigateToMarket,
        handleSessionPress,
        pinSession,
        removeSession,
        setDrawerOpen,
        t,
        theme.colorTextDescription,
        theme.colorTextSecondary,
      ],
    );

    return (
      <FlashList
        data={listData}
        drawDistance={400}
        keyExtractor={(item, index) => {
          if (item.type === 'session') {
            return `session-${item.data.id}`;
          }
          if (item.type === 'discover-agent') {
            return `discover-${item.data.identifier}`;
          }
          return `${item.type}-${index}`;
        }}
        ref={ref}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    );
  }),
);

SessionSearchList.displayName = 'SessionSearchList';

export default SessionSearchList;
