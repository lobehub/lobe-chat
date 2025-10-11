import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AgentRuntimeService } from './AgentRuntimeService';
import type { AgentExecutionParams, SessionCreationParams, StartExecutionParams } from './types';

// Mock database and models
vi.mock('@/database/models/message', () => ({
  MessageModel: vi.fn().mockImplementation(() => ({})),
}));

// Mock dependencies
vi.mock('@/server/modules/AgentRuntime', () => ({
  AgentRuntimeCoordinator: vi.fn().mockImplementation(() => ({
    createAgentSession: vi.fn(),
    saveAgentState: vi.fn(),
    loadAgentState: vi.fn(),
    getSessionMetadata: vi.fn(),
    saveStepResult: vi.fn(),
    getExecutionHistory: vi.fn(),
    getActiveSessions: vi.fn(),
    deleteAgentSession: vi.fn(),
    disconnect: vi.fn(),
  })),
  StreamEventManager: vi.fn().mockImplementation(() => ({
    publishStreamEvent: vi.fn(),
    getStreamHistory: vi.fn(),
  })),
  DurableLobeChatAgent: vi.fn(),
  createStreamingLLMExecutor: vi.fn(),
  createStreamingToolExecutor: vi.fn(),
  createStreamingFinishExecutor: vi.fn(),
  createStreamingHumanApprovalExecutor: vi.fn(),
}));

vi.mock('@lobechat/agent-runtime', () => ({
  AgentRuntime: vi.fn().mockImplementation((agent, options) => ({
    step: vi.fn(),
  })),
}));

vi.mock('@/server/services/queue', () => ({
  QueueService: vi.fn().mockImplementation(() => ({
    scheduleMessage: vi.fn(),
  })),
}));

describe('AgentRuntimeService', () => {
  let service: AgentRuntimeService;
  let mockCoordinator: any;
  let mockStreamManager: any;
  let mockQueueService: any;
  let mockDb: any;
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AGENT_RUNTIME_BASE_URL = 'http://localhost:3010/api/agent';

    // Mock database
    mockDb = {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    service = new AgentRuntimeService(mockDb, mockUserId);

    // Get mocked instances
    mockCoordinator = (service as any).coordinator;
    mockStreamManager = (service as any).streamManager;
    mockQueueService = (service as any).queueService;
  });

  afterEach(() => {
    delete process.env.AGENT_RUNTIME_BASE_URL;
  });

  describe('constructor', () => {
    it('should initialize with default base URL', () => {
      delete process.env.AGENT_RUNTIME_BASE_URL;
      const newService = new AgentRuntimeService(mockDb, mockUserId);
      expect((newService as any).baseURL).toBe('http://localhost:3010/api/agent');
    });

    it('should initialize with custom base URL from environment', () => {
      process.env.AGENT_RUNTIME_BASE_URL = 'http://custom:3000/api/agent';
      const newService = new AgentRuntimeService(mockDb, mockUserId);
      expect((newService as any).baseURL).toBe('http://custom:3000/api/agent');
    });
  });

  describe('createSession', () => {
    const mockParams: SessionCreationParams = {
      sessionId: 'test-session-1',
      initialContext: {
        phase: 'user_input',
        payload: {
          message: { content: 'test' },
          sessionId: 'test-session-1',
          isFirstMessage: true,
        },
        session: { sessionId: 'test-session-1', status: 'idle', stepCount: 0, messageCount: 0 },
      },
      appContext: {},
      agentConfig: { name: 'test-agent' },
      modelRuntimeConfig: { model: 'gpt-4' },
      userId: 'user-123',
      autoStart: true,
      initialMessages: [],
    };

    it('should create session successfully with autoStart=true', async () => {
      mockQueueService.scheduleMessage.mockResolvedValueOnce('message-123');

      const result = await service.createSession(mockParams);

      expect(result).toEqual({
        success: true,
        sessionId: 'test-session-1',
        autoStarted: true,
        messageId: 'message-123',
      });

      expect(mockCoordinator.saveAgentState).toHaveBeenCalledWith(
        'test-session-1',
        expect.objectContaining({
          sessionId: 'test-session-1',
          status: 'idle',
          stepCount: 0,
          messages: [],
          events: [],
        }),
      );

      expect(mockCoordinator.createAgentSession).toHaveBeenCalledWith('test-session-1', {
        agentConfig: mockParams.agentConfig,
        modelRuntimeConfig: mockParams.modelRuntimeConfig,
        userId: mockParams.userId,
      });

      expect(mockQueueService.scheduleMessage).toHaveBeenCalledWith({
        sessionId: 'test-session-1',
        stepIndex: 0,
        context: mockParams.initialContext,
        endpoint: 'http://localhost:3010/api/agent/run',
        priority: 'high',
        delay: 50,
      });
    });

    it('should create session successfully with autoStart=false', async () => {
      const params = { ...mockParams, autoStart: false };

      const result = await service.createSession(params);

      expect(result).toEqual({
        success: true,
        sessionId: 'test-session-1',
        autoStarted: false,
        messageId: undefined,
      });

      expect(mockQueueService.scheduleMessage).not.toHaveBeenCalled();
    });

    it('should handle errors during session creation', async () => {
      mockCoordinator.saveAgentState.mockRejectedValueOnce(new Error('Database error'));

      await expect(service.createSession(mockParams)).rejects.toThrow('Database error');
    });
  });

  describe('executeStep', () => {
    const mockParams: AgentExecutionParams = {
      sessionId: 'test-session-1',
      stepIndex: 1,
      context: {
        phase: 'user_input',
        payload: {
          message: { content: 'test' },
          sessionId: 'test-session-1',
          isFirstMessage: false,
        },
        session: { sessionId: 'test-session-1', status: 'running', stepCount: 1, messageCount: 1 },
      },
    };

    const mockState = {
      sessionId: 'test-session-1',
      status: 'running',
      stepCount: 1,
      messages: [],
      events: [],
      lastModified: new Date().toISOString(),
    };

    const mockMetadata = {
      userId: 'user-123',
      agentConfig: { name: 'test-agent' },
      modelRuntimeConfig: { model: 'gpt-4' },
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      status: 'running',
      totalCost: 0,
      totalSteps: 1,
    };

    beforeEach(() => {
      mockCoordinator.loadAgentState.mockResolvedValue(mockState);
      mockCoordinator.getSessionMetadata.mockResolvedValue(mockMetadata);
    });

    it('should execute step successfully', async () => {
      const mockStepResult = {
        newState: { ...mockState, stepCount: 2, status: 'running' },
        nextContext: mockParams.context,
        events: [],
      };

      // Mock runtime.step
      const mockRuntime = { step: vi.fn().mockResolvedValue(mockStepResult) };
      vi.spyOn(service as any, 'createAgentRuntime').mockReturnValue({ runtime: mockRuntime });

      const result = await service.executeStep(mockParams);

      expect(result).toEqual({
        success: true,
        state: mockStepResult.newState,
        stepResult: expect.objectContaining(mockStepResult),
        nextStepScheduled: true,
      });

      expect(mockStreamManager.publishStreamEvent).toHaveBeenCalledWith('test-session-1', {
        type: 'step_start',
        stepIndex: 1,
        data: {},
      });

      expect(mockStreamManager.publishStreamEvent).toHaveBeenCalledWith('test-session-1', {
        type: 'step_complete',
        stepIndex: 1,
        data: {
          stepIndex: 1,
          finalState: mockStepResult.newState,
          nextStepScheduled: true,
        },
      });

      expect(mockCoordinator.saveStepResult).toHaveBeenCalled();
      expect(mockQueueService.scheduleMessage).toHaveBeenCalled();
    });

    it('should handle missing agent state', async () => {
      mockCoordinator.loadAgentState.mockResolvedValue(null);

      await expect(service.executeStep(mockParams)).rejects.toThrow(
        'Agent state not found for session test-session-1',
      );
    });

    it('should handle execution errors', async () => {
      const error = new Error('Runtime error');
      const mockRuntime = { step: vi.fn().mockRejectedValue(error) };
      vi.spyOn(service as any, 'createAgentRuntime').mockReturnValue({ runtime: mockRuntime });

      await expect(service.executeStep(mockParams)).rejects.toThrow('Runtime error');

      expect(mockStreamManager.publishStreamEvent).toHaveBeenCalledWith('test-session-1', {
        type: 'error',
        stepIndex: 1,
        data: {
          stepIndex: 1,
          phase: 'step_execution',
          error: 'Runtime error',
        },
      });
    });

    it('should handle human intervention', async () => {
      const paramsWithIntervention = {
        ...mockParams,
        humanInput: { type: 'text', content: 'user input' },
        approvedToolCall: { toolName: 'calculator', args: {} },
        rejectionReason: 'Not safe',
      };

      const mockStepResult = {
        newState: { ...mockState, stepCount: 2, status: 'done' },
        nextContext: null,
        events: [],
      };

      const mockRuntime = { step: vi.fn().mockResolvedValue(mockStepResult) };
      vi.spyOn(service as any, 'createAgentRuntime').mockReturnValue({ runtime: mockRuntime });
      vi.spyOn(service as any, 'handleHumanIntervention').mockResolvedValue({
        newState: mockState,
        nextContext: mockParams.context,
      });

      const result = await service.executeStep(paramsWithIntervention);

      expect((service as any).handleHumanIntervention).toHaveBeenCalledWith(
        mockRuntime,
        mockState,
        {
          humanInput: paramsWithIntervention.humanInput,
          approvedToolCall: paramsWithIntervention.approvedToolCall,
          rejectionReason: paramsWithIntervention.rejectionReason,
        },
      );

      expect(result.success).toBe(true);
      expect(result.nextStepScheduled).toBe(false); // Should not schedule next step when status is 'done'
    });
  });

  describe('getSessionStatus', () => {
    const mockState = {
      sessionId: 'test-session-1',
      status: 'running',
      stepCount: 5,
      messages: [{ content: 'msg1' }, { content: 'msg2' }],
      cost: { total: 0.1 },
      usage: { tokens: 100 },
      lastModified: new Date().toISOString(),
    };

    const mockMetadata = {
      userId: 'user-123',
      createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      lastActiveAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    };

    beforeEach(() => {
      mockCoordinator.loadAgentState.mockResolvedValue(mockState);
      mockCoordinator.getSessionMetadata.mockResolvedValue(mockMetadata);
    });

    it('should get session status successfully', async () => {
      const result = await service.getSessionStatus({
        sessionId: 'test-session-1',
        includeHistory: false,
      });

      expect(result).toEqual({
        sessionId: 'test-session-1',
        currentState: expect.objectContaining({
          status: 'running',
          stepCount: 5,
          cost: { total: 0.1 },
          usage: { tokens: 100 },
        }),
        metadata: mockMetadata,
        isActive: true,
        isCompleted: false,
        hasError: false,
        needsHumanInput: false,
        stats: {
          totalSteps: 5,
          totalMessages: 2,
          totalCost: 0.1,
          uptime: expect.any(Number),
          lastActiveTime: expect.any(Number),
        },
      });
    });

    it('should include history when requested', async () => {
      const mockHistory = [{ stepIndex: 1, timestamp: Date.now() }];
      const mockEvents = [{ type: 'step_start', timestamp: Date.now() }];

      mockCoordinator.getExecutionHistory.mockResolvedValue(mockHistory);
      mockStreamManager.getStreamHistory.mockResolvedValue(mockEvents);

      const result = await service.getSessionStatus({
        sessionId: 'test-session-1',
        includeHistory: true,
        historyLimit: 20,
      });

      expect(result.executionHistory).toEqual(mockHistory);
      expect(result.recentEvents).toEqual(mockEvents.slice(0, 10));
    });

    it('should handle missing session', async () => {
      mockCoordinator.loadAgentState.mockResolvedValue(null);
      mockCoordinator.getSessionMetadata.mockResolvedValue(null);

      await expect(
        service.getSessionStatus({
          sessionId: 'nonexistent-session',
        }),
      ).rejects.toThrow('Session not found');
    });

    it('should handle different session statuses', async () => {
      // Test waiting_for_human_input status
      const waitingState = { ...mockState, status: 'waiting_for_human_input' };
      mockCoordinator.loadAgentState.mockResolvedValue(waitingState);

      const result = await service.getSessionStatus({
        sessionId: 'test-session-1',
      });

      expect(result.isActive).toBe(true);
      expect(result.needsHumanInput).toBe(true);
    });
  });

  describe('getPendingInterventions', () => {
    it('should get pending interventions for specific session', async () => {
      const mockState = {
        status: 'waiting_for_human_input',
        pendingToolsCalling: [{ toolName: 'calculator', args: {} }],
        stepCount: 3,
        lastModified: new Date().toISOString(),
      };

      const mockMetadata = {
        userId: 'user-123',
        modelRuntimeConfig: { model: 'gpt-4' },
      };

      mockCoordinator.loadAgentState.mockResolvedValue(mockState);
      mockCoordinator.getSessionMetadata.mockResolvedValue(mockMetadata);

      const result = await service.getPendingInterventions({
        sessionId: 'test-session-1',
      });

      expect(result).toEqual({
        totalCount: 1,
        timestamp: expect.any(String),
        pendingInterventions: [
          {
            sessionId: 'test-session-1',
            type: 'tool_approval',
            status: 'waiting_for_human_input',
            stepCount: 3,
            lastModified: mockState.lastModified,
            userId: 'user-123',
            modelRuntimeConfig: { model: 'gpt-4' },
            pendingToolsCalling: mockState.pendingToolsCalling,
          },
        ],
      });
    });

    it('should get pending interventions for user', async () => {
      const mockSessions = ['session-1', 'session-2'];
      mockCoordinator.getActiveSessions.mockResolvedValue(mockSessions);

      // Mock metadata for filtering by userId
      mockCoordinator.getSessionMetadata
        .mockResolvedValueOnce({ userId: 'user-123' })
        .mockResolvedValueOnce({ userId: 'other-user' });

      // Mock states - only first session needs intervention
      mockCoordinator.loadAgentState
        .mockResolvedValueOnce({
          status: 'waiting_for_human_input',
          pendingHumanPrompt: 'Please confirm',
          stepCount: 2,
          lastModified: new Date().toISOString(),
        })
        .mockResolvedValueOnce({
          status: 'running',
          stepCount: 1,
          lastModified: new Date().toISOString(),
        });

      const result = await service.getPendingInterventions({
        userId: 'user-123',
      });

      expect(result.totalCount).toBe(1);
      expect(result.pendingInterventions[0]).toEqual({
        sessionId: 'session-1',
        type: 'human_prompt',
        status: 'waiting_for_human_input',
        pendingHumanPrompt: 'Please confirm',
        stepCount: 2,
        lastModified: expect.any(String),
        userId: undefined, // getSessionMetadata is not called due to the way sessions are filtered
        modelRuntimeConfig: undefined,
      });
    });

    it('should return empty list when no interventions needed', async () => {
      mockCoordinator.loadAgentState.mockResolvedValue({
        status: 'running',
        stepCount: 1,
      });
      mockCoordinator.getSessionMetadata.mockResolvedValue({ userId: 'user-123' });

      const result = await service.getPendingInterventions({
        sessionId: 'test-session-1',
      });

      expect(result).toEqual({
        totalCount: 0,
        timestamp: expect.any(String),
        pendingInterventions: [],
      });
    });
  });

  describe('startExecution', () => {
    const mockParams: StartExecutionParams = {
      sessionId: 'test-session-1',
      context: {
        phase: 'user_input',
        payload: {
          message: { content: 'test' },
          sessionId: 'test-session-1',
          isFirstMessage: false,
        },
        session: { sessionId: 'test-session-1', status: 'idle', stepCount: 0, messageCount: 0 },
      },
      priority: 'high',
      delay: 500,
    };

    const mockState = {
      sessionId: 'test-session-1',
      status: 'idle',
      stepCount: 2,
      messages: [{ content: 'msg1' }],
      lastModified: new Date().toISOString(),
    };

    const mockMetadata = {
      userId: 'user-123',
      agentConfig: { name: 'test-agent' },
      modelRuntimeConfig: { model: 'gpt-4' },
    };

    beforeEach(() => {
      mockCoordinator.getSessionMetadata.mockResolvedValue(mockMetadata);
      mockCoordinator.loadAgentState.mockResolvedValue(mockState);
      mockQueueService.scheduleMessage.mockResolvedValue('message-456');
    });

    it('should start execution successfully', async () => {
      const result = await service.startExecution(mockParams);

      expect(result).toEqual({
        success: true,
        scheduled: true,
        sessionId: 'test-session-1',
        messageId: 'message-456',
      });

      expect(mockCoordinator.saveAgentState).toHaveBeenCalledWith(
        'test-session-1',
        expect.objectContaining({
          status: 'running',
          lastModified: expect.any(String),
        }),
      );

      expect(mockQueueService.scheduleMessage).toHaveBeenCalledWith({
        sessionId: 'test-session-1',
        stepIndex: 2,
        context: mockParams.context,
        endpoint: 'http://localhost:3010/api/agent/run',
        priority: 'high',
        delay: 500,
      });
    });

    it('should create default context when none provided', async () => {
      const paramsWithoutContext = { ...mockParams };
      delete paramsWithoutContext.context;

      await service.startExecution(paramsWithoutContext);

      expect(mockQueueService.scheduleMessage).toHaveBeenCalledWith({
        sessionId: 'test-session-1',
        stepIndex: 2,
        context: expect.objectContaining({
          phase: 'user_input',
          payload: expect.objectContaining({
            sessionId: 'test-session-1',
            isFirstMessage: true,
            message: expect.objectContaining({
              content: '',
            }),
          }),
          session: expect.objectContaining({
            sessionId: 'test-session-1',
            status: 'idle',
            stepCount: 2,
            messageCount: 1,
          }),
        }),
        endpoint: 'http://localhost:3010/api/agent/run',
        priority: 'high', // Uses the provided priority from params
        delay: 500, // Uses the provided delay from params
      });
    });

    it('should handle session not found', async () => {
      mockCoordinator.getSessionMetadata.mockResolvedValue(null);

      await expect(service.startExecution(mockParams)).rejects.toThrow(
        'Session test-session-1 not found',
      );
    });

    it('should handle already running session', async () => {
      mockCoordinator.loadAgentState.mockResolvedValue({
        ...mockState,
        status: 'running',
      });

      await expect(service.startExecution(mockParams)).rejects.toThrow(
        'Session test-session-1 is already running',
      );
    });

    it('should handle completed session', async () => {
      mockCoordinator.loadAgentState.mockResolvedValue({
        ...mockState,
        status: 'done',
      });

      await expect(service.startExecution(mockParams)).rejects.toThrow(
        'Session test-session-1 is already completed',
      );
    });

    it('should handle error state session', async () => {
      mockCoordinator.loadAgentState.mockResolvedValue({
        ...mockState,
        status: 'error',
      });

      await expect(service.startExecution(mockParams)).rejects.toThrow(
        'Session test-session-1 is in error state',
      );
    });
  });

  describe('processHumanIntervention', () => {
    it('should process human intervention successfully', async () => {
      mockQueueService.scheduleMessage.mockResolvedValue('message-789');

      const result = await service.processHumanIntervention({
        sessionId: 'test-session-1',
        stepIndex: 2,
        action: 'approve',
        approvedToolCall: { toolName: 'calculator', args: {} },
      });

      expect(result).toEqual({
        messageId: 'message-789',
      });

      expect(mockQueueService.scheduleMessage).toHaveBeenCalledWith({
        sessionId: 'test-session-1',
        stepIndex: 2,
        context: undefined,
        endpoint: 'http://localhost:3010/api/agent/run',
        priority: 'high',
        delay: 100,
        payload: {
          approvedToolCall: { toolName: 'calculator', args: {} },
          humanInput: undefined,
          rejectionReason: undefined,
        },
      });
    });

    it('should handle different intervention actions', async () => {
      mockQueueService.scheduleMessage.mockResolvedValue('message-890');

      await service.processHumanIntervention({
        sessionId: 'test-session-1',
        stepIndex: 3,
        action: 'input',
        humanInput: { type: 'text', content: 'user response' },
      });

      expect(mockQueueService.scheduleMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            humanInput: { type: 'text', content: 'user response' },
          }),
        }),
      );
    });
  });

  describe('private methods', () => {
    describe('shouldContinueExecution', () => {
      it('should return false for completed status', () => {
        const shouldContinue = (service as any).shouldContinueExecution(
          { status: 'done' },
          { phase: 'user_input' },
        );
        expect(shouldContinue).toBe(false);
      });

      it('should return false when waiting for human input', () => {
        const shouldContinue = (service as any).shouldContinueExecution(
          { status: 'waiting_for_human_input' },
          { phase: 'user_input' },
        );
        expect(shouldContinue).toBe(false);
      });

      it('should return false when max steps reached', () => {
        const shouldContinue = (service as any).shouldContinueExecution(
          { status: 'running', maxSteps: 10, stepCount: 10 },
          { phase: 'user_input' },
        );
        expect(shouldContinue).toBe(false);
      });

      it('should return false when cost limit exceeded with stop action', () => {
        const shouldContinue = (service as any).shouldContinueExecution(
          {
            status: 'running',
            cost: { total: 1.0 },
            costLimit: { maxTotalCost: 0.5, onExceeded: 'stop' },
          },
          { phase: 'user_input' },
        );
        expect(shouldContinue).toBe(false);
      });

      it('should return true when cost limit exceeded with continue action', () => {
        const shouldContinue = (service as any).shouldContinueExecution(
          {
            status: 'running',
            cost: { total: 1.0 },
            costLimit: { maxTotalCost: 0.5, onExceeded: 'continue' },
          },
          { phase: 'user_input' },
        );
        expect(shouldContinue).toBe(true);
      });

      it('should return false when no context provided', () => {
        const shouldContinue = (service as any).shouldContinueExecution(
          { status: 'running' },
          null,
        );
        expect(shouldContinue).toBe(false);
      });

      it('should return true for normal running state', () => {
        const shouldContinue = (service as any).shouldContinueExecution(
          { status: 'running' },
          { phase: 'user_input' },
        );
        expect(shouldContinue).toBe(true);
      });
    });

    describe('calculateStepDelay', () => {
      it('should return base delay for normal step', () => {
        const delay = (service as any).calculateStepDelay({
          events: [{ type: 'llm_response' }],
        });
        expect(delay).toBe(1000);
      });

      it('should return longer delay for tool calls', () => {
        const delay = (service as any).calculateStepDelay({
          events: [{ type: 'tool_result' }],
        });
        expect(delay).toBe(2000);
      });

      it('should return exponential backoff delay for errors', () => {
        const delay = (service as any).calculateStepDelay({
          events: [{ type: 'error' }],
        });
        expect(delay).toBe(2000);
      });
    });

    describe('calculatePriority', () => {
      it('should return high priority for human input needed', () => {
        const priority = (service as any).calculatePriority({
          newState: { status: 'waiting_for_human_input' },
          events: [],
        });
        expect(priority).toBe('high');
      });

      it('should return normal priority for errors', () => {
        const priority = (service as any).calculatePriority({
          newState: { status: 'running' },
          events: [{ type: 'error' }],
        });
        expect(priority).toBe('normal');
      });

      it('should return normal priority by default', () => {
        const priority = (service as any).calculatePriority({
          newState: { status: 'running' },
          events: [{ type: 'llm_response' }],
        });
        expect(priority).toBe('normal');
      });
    });
  });
});
