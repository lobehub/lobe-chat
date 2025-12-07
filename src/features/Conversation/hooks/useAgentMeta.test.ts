import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useAgentStore } from '@/store/agent';

import { useConversationStore } from '../store';
import { useAgentMeta, useIsBuiltinAgent } from './useAgentMeta';

vi.mock('zustand/traditional');

// Mock @lobechat/const
vi.mock('@lobechat/const', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@lobechat/const')>();
  return {
    ...actual,
    DEFAULT_INBOX_AVATAR: 'lobe-inbox-avatar',
  };
});

// Mock the ConversationStore
vi.mock('../store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../store')>();
  return {
    ...actual,
    useConversationStore: vi.fn(),
  };
});

describe('useAgentMeta', () => {
  it('should return agent meta for regular (non-builtin) agents', () => {
    const mockAgentId = 'regular-agent-123';
    const mockMeta = {
      avatar: 'agent-avatar.png',
      backgroundColor: '#ff0000',
      title: 'My Custom Agent',
      description: 'A custom agent',
    };

    // Mock ConversationStore to return agentId
    vi.mocked(useConversationStore).mockImplementation((selector: any) => {
      const state = { context: { agentId: mockAgentId } };
      return selector(state);
    });

    // Mock AgentStore state
    act(() => {
      useAgentStore.setState({
        agentMap: {
          [mockAgentId]: mockMeta,
        },
        builtinAgentIdMap: {
          inbox: 'inbox-agent-id',
          pageAgent: 'page-agent-id',
        },
      });
    });

    const { result } = renderHook(() => useAgentMeta());

    expect(result.current).toEqual(mockMeta);
    expect(result.current.title).toBe('My Custom Agent');
    expect(result.current.avatar).toBe('agent-avatar.png');
  });

  it('should return Lobe AI avatar and title for builtin inbox agent', () => {
    const mockInboxAgentId = 'inbox-agent-id';
    const mockMeta = {
      avatar: 'original-inbox-avatar.png',
      title: 'Original Inbox Title',
      description: 'Inbox description',
    };

    // Mock ConversationStore to return inbox agentId
    vi.mocked(useConversationStore).mockImplementation((selector: any) => {
      const state = { context: { agentId: mockInboxAgentId } };
      return selector(state);
    });

    // Mock AgentStore state with inbox as builtin agent
    act(() => {
      useAgentStore.setState({
        agentMap: {
          [mockInboxAgentId]: mockMeta,
        },
        builtinAgentIdMap: {
          inbox: mockInboxAgentId,
          pageAgent: 'page-agent-id',
        },
      });
    });

    const { result } = renderHook(() => useAgentMeta());

    // Should override with Lobe AI branding
    expect(result.current.avatar).toBe('lobe-inbox-avatar');
    expect(result.current.title).toBe('Lobe AI');
    // Should preserve other properties
    expect(result.current.description).toBe('Inbox description');
  });

  it('should return Lobe AI avatar and title for page agent (builtin)', () => {
    const mockPageAgentId = 'page-agent-id';
    const mockMeta = {
      avatar: 'page-avatar.png',
      title: 'Page Agent Title',
    };

    vi.mocked(useConversationStore).mockImplementation((selector: any) => {
      const state = { context: { agentId: mockPageAgentId } };
      return selector(state);
    });

    act(() => {
      useAgentStore.setState({
        agentMap: {
          [mockPageAgentId]: mockMeta,
        },
        builtinAgentIdMap: {
          inbox: 'inbox-agent-id',
          pageAgent: mockPageAgentId,
        },
      });
    });

    const { result } = renderHook(() => useAgentMeta());

    expect(result.current.avatar).toBe('lobe-inbox-avatar');
    expect(result.current.title).toBe('Lobe AI');
  });

  it('should handle empty agentMap gracefully', () => {
    const mockAgentId = 'non-existent-agent';

    vi.mocked(useConversationStore).mockImplementation((selector: any) => {
      const state = { context: { agentId: mockAgentId } };
      return selector(state);
    });

    act(() => {
      useAgentStore.setState({
        agentMap: {},
        builtinAgentIdMap: {},
      });
    });

    const { result } = renderHook(() => useAgentMeta());

    // Should return empty object or undefined properties
    expect(result.current).toBeDefined();
  });
});

describe('useIsBuiltinAgent', () => {
  it('should return true for inbox agent', () => {
    const mockInboxAgentId = 'inbox-agent-id';

    vi.mocked(useConversationStore).mockImplementation((selector: any) => {
      const state = { context: { agentId: mockInboxAgentId } };
      return selector(state);
    });

    act(() => {
      useAgentStore.setState({
        builtinAgentIdMap: {
          inbox: mockInboxAgentId,
          pageAgent: 'page-agent-id',
        },
      });
    });

    const { result } = renderHook(() => useIsBuiltinAgent());

    expect(result.current).toBe(true);
  });

  it('should return true for page agent', () => {
    const mockPageAgentId = 'page-agent-id';

    vi.mocked(useConversationStore).mockImplementation((selector: any) => {
      const state = { context: { agentId: mockPageAgentId } };
      return selector(state);
    });

    act(() => {
      useAgentStore.setState({
        builtinAgentIdMap: {
          inbox: 'inbox-agent-id',
          pageAgent: mockPageAgentId,
        },
      });
    });

    const { result } = renderHook(() => useIsBuiltinAgent());

    expect(result.current).toBe(true);
  });

  it('should return false for regular (non-builtin) agent', () => {
    const mockRegularAgentId = 'regular-agent-123';

    vi.mocked(useConversationStore).mockImplementation((selector: any) => {
      const state = { context: { agentId: mockRegularAgentId } };
      return selector(state);
    });

    act(() => {
      useAgentStore.setState({
        builtinAgentIdMap: {
          inbox: 'inbox-agent-id',
          pageAgent: 'page-agent-id',
        },
      });
    });

    const { result } = renderHook(() => useIsBuiltinAgent());

    expect(result.current).toBe(false);
  });

  it('should return false when builtinAgentIdMap is empty', () => {
    vi.mocked(useConversationStore).mockImplementation((selector: any) => {
      const state = { context: { agentId: 'some-agent' } };
      return selector(state);
    });

    act(() => {
      useAgentStore.setState({
        builtinAgentIdMap: {},
      });
    });

    const { result } = renderHook(() => useIsBuiltinAgent());

    expect(result.current).toBe(false);
  });
});
