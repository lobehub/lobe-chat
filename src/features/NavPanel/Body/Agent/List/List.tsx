import { useAnalytics } from '@lobehub/analytics/react';
import Link from 'next/link';
import { CSSProperties, memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { SESSION_CHAT_URL } from '@/const/url';
import { useCreateMenuItems } from '@/features/NavPanel/hooks';
import { useSwitchSession } from '@/hooks/useSwitchSession';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useServerConfigStore } from '@/store/serverConfig';
import { getSessionStoreState } from '@/store/session';
import { sessionGroupSelectors, sessionSelectors } from '@/store/session/selectors';
import { getUserStoreState } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';
import { LobeSessions } from '@/types/session';

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
  const expand = useGlobalStore(systemStatusSelectors.showSessionPanel);
  const mobile = useServerConfigStore((s) => s.isMobile);
  const switchSession = useSwitchSession();
  const { createAgent } = useCreateMenuItems();

  // Early return for empty state
  const isEmpty = useMemo(() => dataSource.length === 0, [dataSource.length]);

  const handleClick = useCallback(
    (id: string) => {
      switchSession(id);

      // Defer analytics tracking to avoid blocking UI
      if (analytics) {
        // Use requestIdleCallback or setTimeout to defer non-critical work
        const trackAnalytics = () => {
          const userStore = getUserStoreState();
          const sessionStore = getSessionStoreState();
          const userId = userProfileSelectors.userId(userStore);
          const session = sessionSelectors.getSessionById(id)(sessionStore);

          if (session) {
            const sessionGroupId = session.group || 'default';
            const group = sessionGroupSelectors.getGroupById(sessionGroupId)(sessionStore);
            const groupName = group?.name || (sessionGroupId === 'default' ? 'Default' : 'Unknown');

            analytics.track({
              name: 'switch_session',
              properties: {
                assistant_name: session.meta?.title || 'Untitled Agent',
                assistant_tags: session.meta?.tags || [],
                group_id: sessionGroupId,
                group_name: groupName,
                session_id: id,
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

  if (isEmpty) {
    if (!expand) return null;
    return (
      <EmptyStatus
        className={itemClassName}
        onClick={() => createAgent({ groupId })}
        title={t('emptyAgentAction')}
      />
    );
  }

  return (
    <Flexbox gap={2} paddingBlock={1}>
      {dataSource.map(({ id }) => (
        <Link
          aria-label={id}
          href={SESSION_CHAT_URL(id, mobile)}
          key={id}
          onClick={(e) => {
            e.preventDefault();
            handleClick(id);
          }}
        >
          <Item className={itemClassName} id={id} style={itemStyle} />
        </Link>
      ))}
    </Flexbox>
  );
});

export default List;
