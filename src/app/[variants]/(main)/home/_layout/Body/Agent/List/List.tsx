import { useAnalytics } from '@lobehub/analytics/react';
import { MoreHorizontal } from 'lucide-react';
import { CSSProperties, memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { Link } from 'react-router-dom';

import { SESSION_CHAT_URL } from '@/const/url';
import NavItem from '@/features/NavPanel/components/NavItem';
import { useCreateMenuItems } from '@/features/NavPanel/hooks';
import { useSwitchSession } from '@/hooks/useSwitchSession';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { getSessionStoreState, useSessionStore } from '@/store/session';
import { sessionGroupSelectors, sessionSelectors } from '@/store/session/selectors';
import { getUserStoreState } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';
import { LobeSessions, SessionDefaultGroup } from '@/types/session';

import EmptyStatus from '../../EmptyStatus';
import Item from './Item';

interface SessionListProps {
  dataSource: LobeSessions;
  groupId?: string;
  itemClassName?: string;
  itemStyle?: CSSProperties;
}

const List = memo<SessionListProps>(({ dataSource, groupId, itemStyle, itemClassName }) => {
  const { t } = useTranslation('chat');
  const { analytics } = useAnalytics();
  const switchSession = useSwitchSession();
  const { createAgent } = useCreateMenuItems();

  // Early return for empty state
  const isEmpty = useMemo(() => dataSource.length === 0, [dataSource.length]);

  const handleClick = useCallback(
    (agentId: string) => {
      switchSession(agentId);

      // Defer analytics tracking to avoid blocking UI
      if (analytics) {
        // Use requestIdleCallback or setTimeout to defer non-critical work
        const trackAnalytics = () => {
          const userStore = getUserStoreState();
          const sessionStore = getSessionStoreState();
          const userId = userProfileSelectors.userId(userStore);
          // TODO: need refactor to agentId
          const session = sessionSelectors.getSessionById(agentId)(sessionStore);

          if (session) {
            const sessionGroupId = session.group || 'default';
            const group = sessionGroupSelectors.getGroupById(sessionGroupId)(sessionStore);
            const groupName = group?.name || (sessionGroupId === 'default' ? 'Default' : 'Unknown');

            analytics.track({
              name: 'switch_session',
              properties: {
                agent_id: agentId,
                assistant_name: session.meta?.title || 'Untitled Agent',
                assistant_tags: session.meta?.tags || [],
                group_id: sessionGroupId,
                group_name: groupName,
                spm: 'homepage.chat.session_list_item.click',
                user_id: userId || 'anonymous',
              },
            });
          }
        };

        // Use native requestIdleCallback if available, otherwise setTimeout
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(trackAnalytics);
        } else {
          setTimeout(trackAnalytics, 0);
        }
      }
    },
    [switchSession, analytics],
  );

  // Check if this is defaultList and if there are more agents
  const isDefaultList = groupId === SessionDefaultGroup.Default;
  const defaultSessionsCount = useSessionStore(sessionSelectors.defaultSessionsCount);
  const agentPageSize = useGlobalStore(systemStatusSelectors.agentPageSize);
  const openAllAgentsDrawer = useSessionStore((s) => s.openAllAgentsDrawer);

  const hasMore = isDefaultList && defaultSessionsCount > agentPageSize;

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
      {dataSource.map(({ id, ...res }) => (
        <Link
          aria-label={id}
          key={id}
          onClick={(e) => {
            e.preventDefault();
            // TODO: need to be fixed
            handleClick((res as any).config?.id);
          }}
          // TODO: need to be fixed
          to={SESSION_CHAT_URL((res as any).config?.id, false)}
        >
          <Item className={itemClassName} id={id} style={itemStyle} />
        </Link>
      ))}
      {hasMore && (
        <NavItem
          icon={MoreHorizontal}
          onClick={openAllAgentsDrawer}
          title={t('more', { defaultValue: '更多' })}
        />
      )}
    </Flexbox>
  );
});

export default List;
