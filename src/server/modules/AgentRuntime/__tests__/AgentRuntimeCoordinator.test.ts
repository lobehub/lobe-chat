import { describe, expect, it, vi } from 'vitest';

import { AgentRuntimeCoordinator } from '../AgentRuntimeCoordinator';
import { AgentStateManager } from '../AgentStateManager';
import { StreamEventManager } from '../StreamEventManager';

// Mock AgentStateManager
vi.mock('../AgentStateManager', () => ({
  AgentStateManager: vi.fn(() => ({
    cleanupExpiredSessions: vi.fn(),
    createSessionMetadata: vi.fn(),
    deleteAgentSession: vi.fn(),
    disconnect: vi.fn(),
    getActiveSessions: vi.fn(),
    getExecutionHistory: vi.fn(),
    getSessionMetadata: vi.fn(),
    getStats: vi.fn(),
    loadAgentState: vi.fn(),
    saveAgentState: vi.fn(),
    saveStepResult: vi.fn(),
  })),
}));

// Mock StreamEventManager
vi.mock('../StreamEventManager', () => ({
  StreamEventManager: vi.fn(() => ({
    cleanupSession: vi.fn(),
    disconnect: vi.fn(),
    publishAgentRuntimeEnd: vi.fn(),
    publishAgentRuntimeInit: vi.fn(),
    publishStreamEvent: vi.fn(),
  })),
}));

describe('AgentRuntimeCoordinator', () => {
  const MockedAgentStateManager = AgentStateManager as any;
  const MockedStreamEventManager = StreamEventManager as any;
  let coordinator: AgentRuntimeCoordinator;
  let mockStateManager: any;
  let mockStreamManager: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockStateManager = {
      cleanupExpiredSessions: vi.fn(),
      createSessionMetadata: vi.fn(),
      deleteAgentSession: vi.fn(),
      disconnect: vi.fn(),
      getActiveSessions: vi.fn(),
      getExecutionHistory: vi.fn(),
      getSessionMetadata: vi.fn(),
      getStats: vi.fn(),
      loadAgentState: vi.fn(),
      saveAgentState: vi.fn(),
      saveStepResult: vi.fn(),
    };

    mockStreamManager = {
      cleanupSession: vi.fn(),
      disconnect: vi.fn(),
      publishAgentRuntimeEnd: vi.fn(),
      publishAgentRuntimeInit: vi.fn(),
      publishStreamEvent: vi.fn(),
    };

    MockedAgentStateManager.mockImplementation(() => mockStateManager);
    MockedStreamEventManager.mockImplementation(() => mockStreamManager);

    coordinator = new AgentRuntimeCoordinator();
  });

  describe('createAgentSession', () => {
    it('should create session metadata and publish init event', async () => {
      const sessionId = 'test-session-id';
      const data = {
        agentConfig: { test: true },
        modelRuntimeConfig: { model: 'gpt-4' },
        userId: 'user-123',
      };
      const metadata = {
        createdAt: '2024-01-01T00:00:00.000Z',
        status: 'idle',
        totalCost: 0,
        totalSteps: 0,
        ...data,
      };

      mockStateManager.getSessionMetadata.mockResolvedValue(metadata);

      await coordinator.createAgentSession(sessionId, data);

      expect(mockStateManager.createSessionMetadata).toHaveBeenCalledWith(sessionId, data);
      expect(mockStateManager.getSessionMetadata).toHaveBeenCalledWith(sessionId);
      expect(mockStreamManager.publishAgentRuntimeInit).toHaveBeenCalledWith(sessionId, metadata);
    });

    it('should not publish init event if metadata creation fails', async () => {
      const sessionId = 'test-session-id';
      const data = { userId: 'user-123' };

      mockStateManager.getSessionMetadata.mockResolvedValue(null);

      await coordinator.createAgentSession(sessionId, data);

      expect(mockStateManager.createSessionMetadata).toHaveBeenCalledWith(sessionId, data);
      expect(mockStreamManager.publishAgentRuntimeInit).not.toHaveBeenCalled();
    });
  });

  describe('saveAgentState', () => {
    it('should save state and publish end event when status changes to done', async () => {
      const sessionId = 'test-session-id';
      const previousState = { status: 'running', stepCount: 3 };
      const newState = { status: 'done', stepCount: 5 };

      mockStateManager.loadAgentState.mockResolvedValue(previousState);

      await coordinator.saveAgentState(sessionId, newState as any);

      expect(mockStateManager.saveAgentState).toHaveBeenCalledWith(sessionId, newState);
      expect(mockStreamManager.publishAgentRuntimeEnd).toHaveBeenCalledWith(
        sessionId,
        newState.stepCount,
        newState,
      );
    });

    it('should not publish end event when status was already done', async () => {
      const sessionId = 'test-session-id';
      const previousState = { status: 'done', stepCount: 5 };
      const newState = { status: 'done', stepCount: 5 };

      mockStateManager.loadAgentState.mockResolvedValue(previousState);

      await coordinator.saveAgentState(sessionId, newState as any);

      expect(mockStateManager.saveAgentState).toHaveBeenCalledWith(sessionId, newState);
      expect(mockStreamManager.publishAgentRuntimeEnd).not.toHaveBeenCalled();
    });

    it('should not publish end event when status is not done', async () => {
      const sessionId = 'test-session-id';
      const previousState = { status: 'idle', stepCount: 0 };
      const newState = { status: 'running', stepCount: 1 };

      mockStateManager.loadAgentState.mockResolvedValue(previousState);

      await coordinator.saveAgentState(sessionId, newState as any);

      expect(mockStateManager.saveAgentState).toHaveBeenCalledWith(sessionId, newState);
      expect(mockStreamManager.publishAgentRuntimeEnd).not.toHaveBeenCalled();
    });
  });

  describe('saveStepResult', () => {
    it('should save step result but not publish end event (left to saveAgentState)', async () => {
      const sessionId = 'test-session-id';
      const stepResult = {
        executionTime: 1000,
        newState: { status: 'done', stepCount: 5 },
        stepIndex: 5,
      };

      await coordinator.saveStepResult(sessionId, stepResult as any);

      expect(mockStateManager.saveStepResult).toHaveBeenCalledWith(sessionId, stepResult);
      // agent_runtime_end 事件现在由 saveAgentState 统一处理，确保它是最后一个事件
      expect(mockStreamManager.publishAgentRuntimeEnd).not.toHaveBeenCalled();
    });

    it('should not publish end event when status is not done', async () => {
      const sessionId = 'test-session-id';
      const stepResult = {
        executionTime: 500,
        newState: { status: 'running', stepCount: 3 },
        stepIndex: 3,
      };

      await coordinator.saveStepResult(sessionId, stepResult as any);

      expect(mockStateManager.saveStepResult).toHaveBeenCalledWith(sessionId, stepResult);
      expect(mockStreamManager.publishAgentRuntimeEnd).not.toHaveBeenCalled();
    });
  });

  describe('deleteAgentSession', () => {
    it('should delete session from both state manager and stream manager', async () => {
      const sessionId = 'test-session-id';

      await coordinator.deleteAgentSession(sessionId);

      expect(mockStateManager.deleteAgentSession).toHaveBeenCalledWith(sessionId);
      expect(mockStreamManager.cleanupSession).toHaveBeenCalledWith(sessionId);
    });
  });

  describe('disconnect', () => {
    it('should disconnect both managers', async () => {
      await coordinator.disconnect();

      expect(mockStateManager.disconnect).toHaveBeenCalled();
      expect(mockStreamManager.disconnect).toHaveBeenCalled();
    });
  });

  describe('delegation methods', () => {
    it('should delegate loadAgentState to state manager', async () => {
      const sessionId = 'test-session-id';
      const expectedState = { status: 'running' };

      mockStateManager.loadAgentState.mockResolvedValue(expectedState);

      const result = await coordinator.loadAgentState(sessionId);

      expect(mockStateManager.loadAgentState).toHaveBeenCalledWith(sessionId);
      expect(result).toBe(expectedState);
    });

    it('should delegate getSessionMetadata to state manager', async () => {
      const sessionId = 'test-session-id';
      const expectedMetadata = { status: 'idle' };

      mockStateManager.getSessionMetadata.mockResolvedValue(expectedMetadata);

      const result = await coordinator.getSessionMetadata(sessionId);

      expect(mockStateManager.getSessionMetadata).toHaveBeenCalledWith(sessionId);
      expect(result).toBe(expectedMetadata);
    });

    it('should delegate getExecutionHistory to state manager', async () => {
      const sessionId = 'test-session-id';
      const limit = 10;
      const expectedHistory = [{ step: 1 }];

      mockStateManager.getExecutionHistory.mockResolvedValue(expectedHistory);

      const result = await coordinator.getExecutionHistory(sessionId, limit);

      expect(mockStateManager.getExecutionHistory).toHaveBeenCalledWith(sessionId, limit);
      expect(result).toBe(expectedHistory);
    });
  });
});
