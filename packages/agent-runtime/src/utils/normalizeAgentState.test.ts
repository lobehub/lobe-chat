import { describe, expect, it } from 'vitest';

import type { AgentState } from '../types';
import { normalizeAgentState } from './normalizeAgentState';

const baseState = (): AgentState =>
  ({
    cost: { total: 0 },
    createdAt: '2026-01-01T00:00:00.000Z',
    lastModified: '2026-01-01T00:00:00.000Z',
    messages: [],
    operationId: 'op_1',
    status: 'idle',
    stepCount: 0,
    toolManifestMap: {},
    usage: {},
  }) as unknown as AgentState;

describe('normalizeAgentState', () => {
  it('returns the same object when metadata carries no legacy keys', () => {
    const state = { ...baseState(), metadata: { _hooks: [], queueRetries: 2 } };
    expect(normalizeAgentState(state)).toBe(state);
  });

  it('lifts legacy metadata keys into world and binding and strips them from metadata', () => {
    const state = {
      ...baseState(),
      metadata: {
        activeDeviceId: 'dev_1',
        agentConfig: { systemRole: 'hi' },
        agentGroup: { agentMap: {} },
        botPlatformContext: { platformName: 'slack', supportsMarkdown: true },
        connectorOwnershipNote: 'note',
        devicePlatform: 'darwin',
        deviceSystemInfo: { workingDirectory: '/tmp' },
        discordContext: { guildId: 'g' },
        evalContext: { caseId: 'c' },
        projectInstructions: [{ content: 'x', source: 'AGENTS.md' }],
        searchDecision: { enabledSearch: true },
        userId: 'u1',
        userMemory: { enabled: true },
        userTimezone: 'Asia/Shanghai',
      },
    };

    const normalized = normalizeAgentState(state);

    expect(normalized.world).toEqual({
      agent: { systemRole: 'hi' },
      channel: {
        botPlatform: { platformName: 'slack', supportsMarkdown: true },
        discord: { guildId: 'g' },
      },
      connectorOwnershipNote: 'note',
      eval: { caseId: 'c' },
      group: { agentMap: {} },
      projectInstructions: [{ content: 'x', source: 'AGENTS.md' }],
      searchDecision: { enabledSearch: true },
      userMemory: { enabled: true },
      userTimezone: 'Asia/Shanghai',
    });
    expect(normalized.binding).toEqual({
      device: { id: 'dev_1', platform: 'darwin', systemInfo: { workingDirectory: '/tmp' } },
    });
    expect(normalized.origin).toEqual({ userId: 'u1' });
    expect(normalized.metadata).toEqual({});
    // Input is not mutated.
    expect(state.metadata.agentConfig).toEqual({ systemRole: 'hi' });
  });

  it('keeps slot values over legacy keys when both are present', () => {
    const state = {
      ...baseState(),
      binding: { device: { id: 'dev_new' } },
      metadata: { activeDeviceId: 'dev_old', agentConfig: { systemRole: 'old' } },
      world: { agent: { systemRole: 'new' } as any },
    };

    const normalized = normalizeAgentState(state);

    expect(normalized.world?.agent).toEqual({ systemRole: 'new' });
    expect(normalized.binding?.device?.id).toBe('dev_new');
    expect(normalized.metadata).toEqual({});
  });

  it('lifts identity, trigger and lineage keys into origin', () => {
    const state = {
      ...baseState(),
      metadata: {
        _hooks: [],
        agentId: 'agent-1',
        agentInterventionContinuation: {
          resolutionRequestId: 'r1',
          sourceOperationId: 'op-0',
          sourceToolMessageIds: ['t1'],
        },
        agentSignal: { kind: 'memory' },
        groupId: null,
        isSubAgent: true,
        orchestrationRole: 'member',
        sourceMessageId: 'msg-1',
        subAgentProgress: { parentOperationId: 'op-0', toolMessageId: 't1' },
        threadId: undefined,
        topicId: 'topic-1',
        trigger: 'chat',
        userId: 'u1',
        workspaceId: 'ws-1',
      },
    };

    const normalized = normalizeAgentState(state);

    expect(normalized.origin).toEqual({
      agentId: 'agent-1',
      continuation: {
        resolutionRequestId: 'r1',
        sourceOperationId: 'op-0',
        sourceToolMessageIds: ['t1'],
      },
      lineage: {
        isSubAgent: true,
        orchestrationRole: 'member',
        progressAnchor: { parentOperationId: 'op-0', toolMessageId: 't1' },
      },
      signal: { kind: 'memory' },
      sourceMessageId: 'msg-1',
      topicId: 'topic-1',
      trigger: 'chat',
      userId: 'u1',
      workspaceId: 'ws-1',
    });
    // `null` / `undefined` legacy values are absent, not carried as null.
    expect('groupId' in normalized.origin!).toBe(false);
    expect('threadId' in normalized.origin!).toBe(false);
    expect(normalized.metadata).toEqual({ _hooks: [] });
  });

  it('merges lifted origin keys into an existing origin without overriding it', () => {
    const state = {
      ...baseState(),
      metadata: { agentId: 'agent-old', topicId: 'topic-1' },
      origin: { agentId: 'agent-new' },
    };

    const normalized = normalizeAgentState(state);

    expect(normalized.origin).toEqual({ agentId: 'agent-new', topicId: 'topic-1' });
    expect(normalized.metadata).toEqual({});
  });

  it('lifts a partial device binding without inventing an id', () => {
    const state = {
      ...baseState(),
      metadata: { deviceSystemInfo: { workingDirectory: '/w' } },
    };

    const normalized = normalizeAgentState(state);

    expect(normalized.binding).toEqual({ device: { systemInfo: { workingDirectory: '/w' } } });
    expect(normalized.world).toBeUndefined();
  });
});
