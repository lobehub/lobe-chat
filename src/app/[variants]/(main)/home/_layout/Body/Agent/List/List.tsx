import { GROUP_CHAT_URL, SESSION_CHAT_URL } from '@lobechat/const';
import type { SidebarAgentItem } from '@lobechat/types';
import { useAnalytics } from '@lobehub/analytics/react';
import { MoreHorizontal } from 'lucide-react';
import { CSSProperties, memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { Link } from 'react-router-dom';

import NavItem from '@/features/NavPanel/components/NavItem';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useHomeStore } from '@/store/home';
import { homeAgentListSelectors } from '@/store/home/selectors';
import { getUserStoreState } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';
import { SessionDefaultGroup } from '@/types/session';

import { useCreateMenuItems } from '../../../hooks';
import EmptyStatus from '../../EmptyStatus';
import Item from './Item';

interface SessionListProps {
  dataSource: SidebarAgentItem[];
  groupId?: string;
  itemClassName?: string;
  itemStyle?: CSSProperties;
  onMoreClick?: () => void;
}

const List = memo<SessionListProps>(
  ({ onMoreClick, dataSource, groupId, itemStyle, itemClassName }) => {
    const { t } = useTranslation('chat');
    const { analytics } = useAnalytics();
    const router = useQueryRoute();
    const togglePortal = useChatStore((s) => s.togglePortal);
    const { createAgent } = useCreateMenuItems();

    // Early return for empty state
    const isEmpty = useMemo(() => dataSource.length === 0, [dataSource.length]);

    // Get URL based on item type
    const getItemUrl = useCallback((item: SidebarAgentItem) => {
      if (item.type === 'group') {
        return GROUP_CHAT_URL(item.id);
      }
      return SESSION_CHAT_URL(item.id, false);
    }, []);

    const handleClick = useCallback(
      (item: SidebarAgentItem) => {
        togglePortal(false);
        router.push(getItemUrl(item));

        // Defer analytics tracking to avoid blocking UI
        if (analytics) {
          // Use requestIdleCallback or setTimeout to defer non-critical work
          const trackAnalytics = () => {
            const userStore = getUserStoreState();
            const userId = userProfileSelectors.userId(userStore);

            analytics.track({
              name: 'switch_session',
              properties: {
                agent_id: item.id,
                assistant_name: item.title || 'Untitled Agent',
                spm: 'homepage.chat.session_list_item.click',
                user_id: userId || 'anonymous',
              },
            });
          };

          // Use native requestIdleCallback if available, otherwise setTimeout
          if (typeof requestIdleCallback !== 'undefined') {
            requestIdleCallback(trackAnalytics);
          } else {
            setTimeout(trackAnalytics, 0);
          }
        }
      },
      [togglePortal, router, getItemUrl, analytics],
    );

    // Check if this is defaultList and if there are more agents
    const isDefaultList = groupId === SessionDefaultGroup.Default;
    const ungroupedAgentsCount = useHomeStore(homeAgentListSelectors.ungroupedAgentsCount);
    const agentPageSize = useGlobalStore(systemStatusSelectors.agentPageSize);
    const openAllAgentsDrawer = useHomeStore((s) => s.openAllAgentsDrawer);

    const hasMore = isDefaultList && ungroupedAgentsCount > agentPageSize;

    if (isEmpty) {
      return (
        <EmptyStatus
          className={itemClassName}
          onClick={() => createAgent({ groupId })}
          title={t('emptyAgentAction')}
        />
      );
    }

    return (
      <Flexbox gap={1}>
        {dataSource.map((item) => (
          <Link
            aria-label={item.id}
            key={item.id}
            onClick={(e) => {
              // Allow default behavior for Cmd+Click (Mac) / Ctrl+Click (Windows/Linux) to open in new window
              if (e.metaKey || e.ctrlKey) return;

              e.preventDefault();
              handleClick(item);
            }}
            to={getItemUrl(item)}
          >
            <Item className={itemClassName} item={item} style={itemStyle} />
          </Link>
        ))}
        {hasMore && (
          <NavItem
            icon={MoreHorizontal}
            onClick={onMoreClick || openAllAgentsDrawer}
            title={t('input.more')}
          />
        )}
      </Flexbox>
    );
  },
);

export default List;
