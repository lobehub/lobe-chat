import { memo } from 'react';

import { useHomeStore } from '@/store/home';
import { useServerConfigStore } from '@/store/serverConfig';
import { serverConfigSelectors } from '@/store/serverConfig/selectors';

import { useAgentSearch } from '../Layout/AgentSearchContext';
import SkeletonList from '../SkeletonList';
import { AgentSearchList } from './AgentSearchList';
import { getVisibleAgentSearchResults } from './agentSearchResults';

const SearchMode = memo(() => {
  const { keywords: sessionSearchKeywords } = useAgentSearch();
  const useSearchAgents = useHomeStore((s) => s.useSearchAgents);

  const isMobile = useServerConfigStore(serverConfigSelectors.isMobile);

  const { data, isLoading } = useSearchAgents(sessionSearchKeywords?.trim() || undefined);
  const filteredData = getVisibleAgentSearchResults(data, isMobile);

  return isLoading ? <SkeletonList /> : <AgentSearchList dataSource={filteredData} />;
});

SearchMode.displayName = 'SessionSearchMode';

export default SearchMode;
