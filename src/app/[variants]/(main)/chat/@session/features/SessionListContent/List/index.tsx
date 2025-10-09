import { useAnalytics } from '@lobehub/analytics/react';
import { Empty } from 'antd';
import { createStyles } from 'antd-style';
import Link from 'next/link';
import { memo, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';
import LazyLoad from 'react-lazy-load';

import { SESSION_CHAT_URL } from '@/const/url';
import { isDesktop } from '@/const/version';
import { useSwitchSession } from '@/hooks/useSwitchSession';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { getSessionStoreState, useSessionStore } from '@/store/session';
import { sessionGroupSelectors, sessionSelectors } from '@/store/session/selectors';
import { getUserStoreState } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';
import { LobeAgentSession } from '@/types/session';

import SkeletonList from '../../SkeletonList';
import AddButton from './AddButton';
import SessionItem from './Item';

const useStyles = createStyles(
  ({ css }) => css`
    min-height: 70px;
  `,
);

const DESKTOP_DOUBLE_CLICK_DELAY = 200;
interface SessionListProps {
  dataSource?: LobeAgentSession[];
  groupId?: string;
  showAddButton?: boolean;
}
const SessionList = memo<SessionListProps>(({ dataSource, groupId, showAddButton = true }) => {
  const { t } = useTranslation('chat');
  const { analytics } = useAnalytics();
  const { styles } = useStyles();

  const clickTimersRef = useRef<Record<string, ReturnType<typeof setTimeout> | null>>({});

  const isInit = useSessionStore(sessionSelectors.isSessionListInit);
  const { showCreateSession } = useServerConfigStore(featureFlagsSelectors);
  const mobile = useServerConfigStore((s) => s.isMobile);

  const switchSession = useSwitchSession();

  const runSwitchSession = useCallback(
    (sessionId: string) => {
      switchSession(sessionId);

      if (!analytics) return;

      const userStore = getUserStoreState();
      const sessionStore = getSessionStoreState();

      const userId = userProfileSelectors.userId(userStore);
      const session = sessionSelectors.getSessionById(sessionId)(sessionStore);

      if (!session) return;

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
          session_id: sessionId,
          spm: 'homepage.chat.session_list_item.click',
          user_id: userId || 'anonymous',
        },
      });
    },
    [analytics, switchSession],
  );

  const scheduleDesktopClick = useCallback(
    (sessionId: string) => {
      const timers = clickTimersRef.current;
      const prevTimer = timers[sessionId];

      if (prevTimer) {
        clearTimeout(prevTimer);
      }

      timers[sessionId] = setTimeout(() => {
        runSwitchSession(sessionId);
        timers[sessionId] = null;
      }, DESKTOP_DOUBLE_CLICK_DELAY);
    },
    [runSwitchSession],
  );

  const cancelDesktopClick = useCallback((sessionId: string) => {
    const timers = clickTimersRef.current;
    const timer = timers[sessionId];

    if (timer) {
      clearTimeout(timer);
      timers[sessionId] = null;
    }
  }, []);

  useEffect(
    () => () => {
      const timers = clickTimersRef.current;
      Object.values(timers).forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    },
    [],
  );

  const isEmpty = !dataSource || dataSource.length === 0;
  return !isInit ? (
    <SkeletonList />
  ) : !isEmpty ? (
    dataSource.map(({ id }) => (
      <LazyLoad className={styles} key={id}>
        <Link
          aria-label={id}
          href={SESSION_CHAT_URL(id, mobile)}
          onClick={(e) => {
            e.preventDefault();
            if (isDesktop) {
              scheduleDesktopClick(id);
            } else {
              runSwitchSession(id);
            }
          }}
        >
          <SessionItem id={id} onDesktopDoubleClick={() => cancelDesktopClick(id)} />
        </Link>
      </LazyLoad>
    ))
  ) : showCreateSession ? (
    showAddButton && <AddButton groupId={groupId} />
  ) : (
    <Center>
      <Empty description={t('emptyAgent')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
    </Center>
  );
});

export default SessionList;
