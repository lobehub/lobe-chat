'use client';

import isEqual from 'fast-deep-equal';
import { useMemo } from 'react';

import { useFetchAgentList } from '@/hooks/useFetchAgentList';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { homeSelectors, useHomeStore } from '@/store/home';

export const useAgentList = (limitDefault = true) => {
  useFetchAgentList();

  const agentPageSize = useGlobalStore(systemStatusSelectors.agentPageSize);
  const ungroupedAgents = useHomeStore(
    limitDefault
      ? homeSelectors.ungroupedAgentsLimited(agentPageSize)
      : homeSelectors.ungroupedAgents,
    isEqual,
  );
  const agentGroups = useHomeStore(homeSelectors.agentGroups, isEqual);
  const pinnedAgents = useHomeStore(homeSelectors.pinnedAgents, isEqual);

  return useMemo(() => {
    return {
      customList: agentGroups,
      defaultList: ungroupedAgents,
      pinnedList: pinnedAgents,
    };
  }, [agentGroups, pinnedAgents, ungroupedAgents]);
};
