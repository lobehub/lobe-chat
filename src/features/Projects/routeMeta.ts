import { ClipboardCheckIcon, FolderClosedIcon } from 'lucide-react';

import ConversationSegmentSkeleton from '@/components/Skeleton/Conversation/Segment';
import { createSurfaceSkeleton } from '@/components/Skeleton/Surface';
import { usePublishDynamicRouteMeta } from '@/features/RouteMeta/usePublishDynamicRouteMeta';
import { matchesRouteWorkspace, useRouteWorkspaceId } from '@/features/RouteMeta/workspaceScope';
import type { DynamicRouteMetaProps, RouteMetaParams } from '@/spa/router/routeMeta';
import { routeMeta } from '@/spa/router/routeMeta';
import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';
import { useProjectStore } from '@/store/project';

export const projectsRouteMeta = routeMeta({
  icon: FolderClosedIcon,
  Skeleton: createSurfaceSkeleton('grid'),
  titleKey: 'navigation.projects',
});

export const projectDirectoriesRouteMeta = routeMeta({
  icon: FolderClosedIcon,
  Skeleton: createSurfaceSkeleton('list'),
  titleKey: 'project:settings.title',
});

export const useProjectConversationTitle = (params: RouteMetaParams): string | undefined => {
  const routeWorkspaceId = useRouteWorkspaceId(params);
  const projectName = useProjectStore((state) => {
    const detail = params.projectId ? state.projectDetailMap[params.projectId] : undefined;
    if (!matchesRouteWorkspace(detail?.project.workspaceId, routeWorkspaceId)) return undefined;
    return detail?.project.name || undefined;
  });
  const topicTitle = useChatStore((state) =>
    params.topicId ? topicSelectors.getTopicById(params.topicId)(state)?.title : undefined,
  );

  return [topicTitle, projectName].filter(Boolean).join(' · ') || undefined;
};

const ProjectConversationDynamicMeta = ({ onResolve, params }: DynamicRouteMetaProps) => {
  const title = useProjectConversationTitle(params);

  usePublishDynamicRouteMeta({ title }, onResolve);

  return null;
};

export const projectConversationRouteMeta = routeMeta({
  DynamicMeta: ProjectConversationDynamicMeta,
  icon: FolderClosedIcon,
  Skeleton: ConversationSegmentSkeleton,
  titleKey: 'project:topics.title',
});

// The project acceptance section has no `:acceptanceId` param, so it cannot
// reuse `acceptanceRouteMeta` — its DynamicMeta would pin the tab to the
// generic fallback label.
export const projectAcceptanceRouteMeta = routeMeta({
  icon: ClipboardCheckIcon,
  Skeleton: createSurfaceSkeleton('detail'),
  titleKey: 'project:sections.acceptance',
});
