import { Text } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useServerConfigStore } from '@/store/serverConfig';
import { serverConfigSelectors } from '@/store/serverConfig/selectors';
import { useSessionStore } from '@/store/session';
import { LobeAgentSession, LobeSessionType, LobeSessions } from '@/types/session';

import SkeletonList from '../SkeletonList';
import SessionList from './List';
import SearchMessages from './SearchMessages';

const SearchMode = memo(() => {
  const { t } = useTranslation('chat');
  const [sessionSearchKeywords, useSearchSessions] = useSessionStore((s) => [
    s.sessionSearchKeywords,
    s.useSearchSessions,
  ]);

  const isMobile = useServerConfigStore(serverConfigSelectors.isMobile);

  const { data, isLoading } = useSearchSessions(sessionSearchKeywords);
  const hasSessionResults = (data?.length ?? 0) > 0;

  return (
    <>
      <SearchMessages keyword={sessionSearchKeywords || ''} />
      {isLoading ? (
        <SkeletonList />
      ) : hasSessionResults ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
          <Text type={'secondary'}>{t('searchSessions.title')}</Text>
          <SessionList dataSource={data} showAddButton={false} />
        </div>
      ) : null}
    </>
  );
});

SearchMode.displayName = 'SessionSearchMode';

export default SearchMode;
