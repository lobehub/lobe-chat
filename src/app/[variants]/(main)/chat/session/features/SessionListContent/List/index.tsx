import { useAnalytics } from '@lobehub/analytics/react';
import { Empty } from 'antd';
import { createStyles } from 'antd-style';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';
import LazyLoad from 'react-lazy-load';

import { SESSION_CHAT_URL } from '@/const/url';
import { useSwitchSession } from '@/hooks/useSwitchSession';
import { useSessionStore, getSessionStoreState } from '@/store/session';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { sessionGroupSelectors, sessionSelectors } from '@/store/session/selectors';
import { getUserStoreState } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';
import { LobeSessions } from '@/types/session';

import SkeletonList from '../../SkeletonList';
import AddButton from './AddButton';
import SessionItem from './Item';

const useStyles = createStyles(
  ({ css }) => css`
    min-height: 70px;
  `,
);
interface SessionListProps {
  dataSource?: LobeSessions;
  groupId?: string;
  showAddButton?: boolean;
}
const SessionList = memo<SessionListProps>(({ dataSource, groupId, showAddButton = true }) => {
  const { t } = useTranslation('chat');
  const { analytics } = useAnalytics();
  const { styles } = useStyles();

  const isInit = useSessionStore(sessionSelectors.isSessionListInit);
  const { showCreateSession } = useServerConfigStore(featureFlagsSelectors);
  const mobile = useServerConfigStore((s) => s.isMobile);

  const switchSession = useSwitchSession();

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
            switchSession(id);

            // Enhanced analytics tracking
            if (analytics) {
              const userStore = getUserStoreState();
              const sessionStore = getSessionStoreState();

              const userId = userProfileSelectors.userId(userStore);
              const session = sessionSelectors.getSessionById(id)(sessionStore);

              if (session) {
                const sessionGroupId = session.group || 'default';
                const group = sessionGroupSelectors.getGroupById(sessionGroupId)(sessionStore);
                const groupName =
                  group?.name || (sessionGroupId === 'default' ? 'Default' : 'Unknown');

                analytics?.track({
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
            }
          }}
        >
          <SessionItem id={id} />
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
