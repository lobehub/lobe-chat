import { agentDisplayName } from '@lobechat/types';
import useSWR from 'swr';

import { usePublishDynamicRouteMeta } from '@/features/RouteMeta/usePublishDynamicRouteMeta';
import { shareKeys } from '@/libs/swr/keys';
import type { DynamicRouteMetaProps } from '@/spa/router/routeMeta';

import type { useSharedAgent } from './useSharedAgent';

export const useAgentShareVisitorRouteMeta = ({ onResolve, params }: DynamicRouteMetaProps) => {
  /** The page owns fetching because fetching a share also counts a page view. */
  const { data, error } = useSWR<ReturnType<typeof useSharedAgent>['data']>(
    params.slugOrId ? shareKeys.agentInfo(params.slugOrId) : null,
    null,
    { revalidateOnMount: false },
  );

  usePublishDynamicRouteMeta(
    { title: error ? undefined : agentDisplayName(data?.agentMeta) },
    onResolve,
  );
};

const AgentShareVisitorDynamicMeta = (props: DynamicRouteMetaProps) => {
  useAgentShareVisitorRouteMeta(props);

  return null;
};

export default AgentShareVisitorDynamicMeta;
