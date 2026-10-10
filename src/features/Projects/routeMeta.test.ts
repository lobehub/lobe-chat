import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useChatStore } from '@/store/chat';
import { type ProjectDetail, useProjectStore } from '@/store/project';
import type { ChatTopic } from '@/types/topic';

import {
  projectAcceptanceRouteMeta,
  projectConversationRouteMeta,
  useProjectConversationTitle,
} from './routeMeta';

vi.mock('@/features/RouteMeta/workspaceScope', () => ({
  matchesRouteWorkspace: () => true,
  useRouteWorkspaceId: () => null,
}));

const seedStores = () => {
  useProjectStore.setState({
    projectDetailMap: {
      prj_1: {
        project: { id: 'prj_1', name: 'Alpha', workspaceId: null },
      } as ProjectDetail,
    },
  });
  useChatStore.setState({
    topicDetailMap: { tpc_1: { id: 'tpc_1', title: 'Fix login' } as ChatTopic },
  });
};

describe('useProjectConversationTitle', () => {
  afterEach(() => {
    useChatStore.setState({ topicDataMap: {}, topicDetailMap: {} });
    useProjectStore.setState({ projectDetailMap: {} });
  });

  it('resolves the topic title and project name for a conversation tab', () => {
    seedStores();

    const { result } = renderHook(() =>
      useProjectConversationTitle({ projectId: 'prj_1', topicId: 'tpc_1' }),
    );

    expect(result.current).toBe('Fix login · Alpha');
  });

  it('falls back to the project name when the topic is not loaded yet', () => {
    seedStores();

    const { result } = renderHook(() => useProjectConversationTitle({ projectId: 'prj_1' }));

    expect(result.current).toBe('Alpha');
  });

  it('publishes no title before the project detail lands', () => {
    const { result } = renderHook(() =>
      useProjectConversationTitle({ projectId: 'prj_1', topicId: 'tpc_1' }),
    );

    expect(result.current).toBeUndefined();
  });
});

describe('project route metas', () => {
  it('resolves the conversation tab title dynamically', () => {
    expect(projectConversationRouteMeta.titleKey).toBe('project:topics.title');
    expect(projectConversationRouteMeta.DynamicMeta).toBeDefined();
  });

  // Regression: the project acceptance section reused `acceptanceRouteMeta`,
  // whose DynamicMeta cannot read an `:acceptanceId` here, so every project
  // acceptance tab was persisted with the generic fallback title.
  it('gives the project acceptance section its own static title and no runner', () => {
    expect(projectAcceptanceRouteMeta.titleKey).toBe('project:sections.acceptance');
    expect(projectAcceptanceRouteMeta.icon).toBeDefined();
    expect(projectAcceptanceRouteMeta.DynamicMeta).toBeUndefined();
  });
});
