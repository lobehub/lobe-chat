import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ClientToolResumeError,
  executeResponseRun,
  resumeParkedClientTools,
} from '../client-tool-resume.responses';

const db = vi.hoisted(() => ({
  createMessage: vi.fn(),
  findOperation: vi.fn(),
  findTopic: vi.fn(),
  findToolMessageId: vi.fn(),
  tryResume: vi.fn(),
  updateToolMessage: vi.fn(),
}));

vi.mock('@/database/models/topic', () => ({
  TopicModel: class {
    findById = db.findTopic;
  },
}));
vi.mock('@/database/models/agentOperation', () => ({
  AgentOperationModel: class {
    findById = db.findOperation;
    tryResumeFromAsyncTool = db.tryResume;
  },
}));
vi.mock('@/database/models/message', () => ({
  MessageModel: class {
    create = db.createMessage;
    findToolMessageIdByToolCallId = db.findToolMessageId;
    updateToolMessage = db.updateToolMessage;
  },
}));

const weatherCall = { apiName: 'get_weather', arguments: '{}', id: 'call_1', identifier: 'fn' };

const parkedState = () => ({
  messages: [
    { content: 'weather?', id: 'msg_user', role: 'user' },
    { content: '', id: 'msg_assistant', role: 'assistant', tool_calls: [{ id: 'call_1' }] },
  ],
  origin: { agentId: 'agt_1', topicId: 'tpc_1' },
  pendingToolsCalling: [weatherCall],
  status: 'waiting_for_async_tool',
  stepCount: 2,
});

const runtime = (state: unknown = parkedState()) => {
  const executeStep = vi.fn();
  const executeSync = vi.fn();
  return {
    executeStep,
    executeSync,
    getCoordinator: () => ({ loadAgentState: vi.fn().mockResolvedValue(state) }),
  };
};

const resume = (agentRuntimeService: unknown, outputs = [{ call_id: 'call_1', output: 'sunny' }]) =>
  resumeParkedClientTools({
    agentRuntimeService: agentRuntimeService as any,
    db: null as any,
    outputs: outputs.map((item) => ({ ...item, type: 'function_call_output' as const })),
    topicId: 'tpc_1',
    userId: 'user_1',
  });

describe('resumeParkedClientTools', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.findTopic.mockResolvedValue({
      metadata: { runningOperation: { operationId: 'op_parked' } },
    });
    db.findOperation.mockResolvedValue({
      agentId: 'agt_1',
      interruption: { reason: 'client_tool_execution' },
      status: 'waiting_for_async_tool',
    });
    db.findToolMessageId.mockResolvedValue(null);
    db.tryResume.mockResolvedValue(true);
  });

  it('answers the parked call with its output and claims the run', async () => {
    await expect(resume(runtime())).resolves.toEqual({ operationId: 'op_parked' });

    expect(db.createMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        agentId: 'agt_1',
        content: 'sunny',
        parentId: 'msg_assistant',
        plugin: weatherCall,
        role: 'tool',
        tool_call_id: 'call_1',
        topicId: 'tpc_1',
      }),
    );
    expect(db.tryResume).toHaveBeenCalledWith('op_parked');
  });

  it('fills a result row that already exists instead of adding another', async () => {
    db.findToolMessageId.mockResolvedValue('msg_tool');

    await resume(runtime());

    expect(db.findToolMessageId).toHaveBeenCalledWith('call_1', 'msg_assistant');
    expect(db.updateToolMessage).toHaveBeenCalledWith('msg_tool', { content: 'sunny' });
    expect(db.createMessage).not.toHaveBeenCalled();
  });

  it('leaves topics without a run parked on client tools to a new run', async () => {
    db.findOperation.mockResolvedValueOnce({
      interruption: { reason: 'async_tool' },
      status: 'waiting_for_async_tool',
    });
    await expect(resume(runtime())).resolves.toBeUndefined();

    db.findTopic.mockResolvedValueOnce({ metadata: {} });
    await expect(resume(runtime())).resolves.toBeUndefined();

    expect(db.createMessage).not.toHaveBeenCalled();
    expect(db.tryResume).not.toHaveBeenCalled();
  });

  it('rejects outputs that do not match the parked calls, before writing anything', async () => {
    await expect(resume(runtime(), [])).rejects.toThrow(
      new ClientToolResumeError('No tool output found for function call call_1.'),
    );
    await expect(
      resume(runtime(), [
        { call_id: 'call_1', output: 'sunny' },
        { call_id: 'call_x', output: '?' },
      ]),
    ).rejects.toThrow('No tool call found for function call output with call_id call_x.');

    expect(db.createMessage).not.toHaveBeenCalled();
    expect(db.tryResume).not.toHaveBeenCalled();
  });

  it('refuses a second delivery of the same outputs', async () => {
    db.tryResume.mockResolvedValue(false);

    await expect(resume(runtime())).rejects.toThrow(ClientToolResumeError);
  });
});

describe('executeResponseRun', () => {
  it('takes the first step of a resumed run as the async-tool resume', async () => {
    const service = runtime();
    const nextContext = { phase: 'llm_result' };
    service.executeStep.mockResolvedValue({ state: {}, stepResult: { nextContext } });
    service.executeSync.mockResolvedValue({ status: 'done' });

    await expect(
      executeResponseRun(service as any, { operationId: 'op_parked', resumed: true }),
    ).resolves.toEqual({ status: 'done' });

    expect(service.executeStep).toHaveBeenCalledWith({
      operationId: 'op_parked',
      resumeAsyncTool: true,
      stepIndex: 2,
    });
    expect(service.executeSync).toHaveBeenCalledWith('op_parked', { initialContext: nextContext });
  });

  it('runs a new operation as before', async () => {
    const service = runtime();
    service.executeSync.mockResolvedValue({ status: 'done' });

    await executeResponseRun(service as any, { operationId: 'op_new' });

    expect(service.executeStep).not.toHaveBeenCalled();
    expect(service.executeSync).toHaveBeenCalledWith('op_new');
  });
});
