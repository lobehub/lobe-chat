import { useAnalytics } from '@lobehub/analytics/react';
import { Empty } from 'antd';
import Link from 'next/link';
import { CSSProperties, memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { SESSION_CHAT_URL } from '@/const/url';
import { useSwitchSession } from '@/hooks/useSwitchSession';
import { useServerConfigStore } from '@/store/serverConfig';
import { getSessionStoreState } from '@/store/session';
import { sessionGroupSelectors, sessionSelectors } from '@/store/session/selectors';
import { getUserStoreState } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';
import { LobeSessions } from '@/types/session';

import Item from './Item';

interface SessionListProps {
  dataSource?: LobeSessions;
  itemStyle?: CSSProperties;
}
const List = memo<SessionListProps>(({ dataSource, itemStyle }) => {
  const { t } = useTranslation('chat');
  const { analytics } = useAnalytics();

  const mobile = useServerConfigStore((s) => s.isMobile);

  const switchSession = useSwitchSession();

  const isEmpty = !dataSource || dataSource.length === 0;

  const handleClick = useCallback(
    (id: string) => {
      switchSession(id);
      if (analytics) {
        const userStore = getUserStoreState();
        const sessionStore = getSessionStoreState();
        const userId = userProfileSelectors.userId(userStore);
        const session = sessionSelectors.getSessionById(id)(sessionStore);
        if (session) {
          const sessionGroupId = session.group || 'default';
          const group = sessionGroupSelectors.getGroupById(sessionGroupId)(sessionStore);
          const groupName = group?.name || (sessionGroupId === 'default' ? 'Default' : 'Unknown');

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
    },
    [switchSession, analytics],
  );

  if (isEmpty)
    return (
      <Center>
        <Empty description={t('emptyAgent')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Center>
    );

  return (
    <Flexbox gap={1} paddingBlock={1}>
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
          <Item id={id} style={itemStyle} />
        </Link>
      ))}
    </Flexbox>
  );
});

export default List;
