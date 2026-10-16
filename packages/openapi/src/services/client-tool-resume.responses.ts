import type { AgentState } from '@lobechat/agent-runtime';
import type { ChatToolPayload } from '@lobechat/types';

import { AgentOperationModel } from '@/database/models/agentOperation';
import { MessageModel } from '@/database/models/message';
import { TopicModel } from '@/database/models/topic';
import type { LobeChatDatabase } from '@/database/type';
import type { AgentRuntimeService } from '@/server/services/agentRuntime';

import type { FunctionCallOutputItem } from '../types/responses.type';

/**
 * A request the caller sent wrong: an output for a call nobody made, or a call
 * left without one. Surfaces as a failed response rather than a silent re-run.
 */
export class ClientToolResumeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ClientToolResumeError';
  }
}

/** The assistant message that issued `callId`, which its result row hangs off. */
const findCallingAssistantId = (state: AgentState, callId: string): string | undefined => {
  for (const message of [...(state.messages ?? [])].reverse()) {
    if (message?.role !== 'assistant') continue;
    const calls = [...(message.tool_calls ?? []), ...(message.tools ?? [])];
    if (calls.some((call: { id?: string }) => call?.id === callId)) return message.id;
  }
  return state.metadata?.workAssistantMessageId;
};

interface ResumeParams {
  agentRuntimeService: AgentRuntimeService;
  db: LobeChatDatabase;
  outputs: FunctionCallOutputItem[];
  topicId: string;
  userId: string;
  workspaceId?: string;
}

/**
 * Hand the caller's `function_call_output` items to the run parked on this
 * topic and continue that same run, the way an OpenResponses client expects
 * `previous_response_id` + tool outputs to behave.
 *
 * The run parked itself (`waiting_for_async_tool`, `client_tool_execution`)
 * when the model called one of the caller's function tools. Nothing else will
 * ever deliver those results, and the run keeps the topic's `runningOperation`
 * marker: a new run on the topic is refused as busy, and the gateway's
 * inactivity watchdog eventually writes the parked turn off as abandoned.
 *
 * Writes each output as the tool result of its call, claims the park, and runs
 * the resume step. Returns the operation to keep executing, or `undefined` when
 * no such park exists, so the caller can start a new run instead.
 */
export const resumeParkedClientTools = async ({
  agentRuntimeService,
  db,
  outputs,
  topicId,
  userId,
  workspaceId,
}: ResumeParams): Promise<{ operationId: string } | undefined> => {
  const topic = await new TopicModel(db, userId, workspaceId).findById(topicId);
  const operationId = topic?.metadata?.runningOperation?.operationId;
  if (!operationId) return;

  const operationModel = new AgentOperationModel(db, userId, workspaceId);
  const operation = await operationModel.findById(operationId);
  if (
    operation?.status !== 'waiting_for_async_tool' ||
    operation.interruption?.reason !== 'client_tool_execution'
  )
    return;

  const state = await agentRuntimeService.getCoordinator().loadAgentState(operationId);
  if (state?.status !== 'waiting_for_async_tool') return;

  const pending = (state.pendingToolsCalling ?? []) as ChatToolPayload[];
  const outputByCallId = new Map(outputs.map((item) => [item.call_id, item.output]));
  for (const item of outputs) {
    if (!pending.some((tool) => tool.id === item.call_id))
      throw new ClientToolResumeError(
        `No tool call found for function call output with call_id ${item.call_id}.`,
      );
  }
  for (const tool of pending) {
    if (!outputByCallId.has(tool.id))
      throw new ClientToolResumeError(`No tool output found for function call ${tool.id}.`);
  }

  const messageModel = new MessageModel(db, userId, workspaceId);
  const agentId = state.origin?.agentId ?? operation.agentId ?? undefined;
  for (const tool of pending) {
    const content = outputByCallId.get(tool.id)!;
    const parentId = findCallingAssistantId(state, tool.id);
    const existingId = await messageModel.findToolMessageIdByToolCallId(tool.id, parentId);
    if (existingId) {
      await messageModel.updateToolMessage(existingId, { content });
      continue;
    }
    await messageModel.create({
      agentId,
      content,
      groupId: state.origin?.groupId ?? undefined,
      parentId,
      plugin: tool as any,
      role: 'tool',
      threadId: state.origin?.threadId ?? undefined,
      tool_call_id: tool.id,
      topicId,
    });
  }

  // Two deliveries of the same outputs race here; only one resumes the run.
  if (!(await operationModel.tryResumeFromAsyncTool(operationId)))
    throw new ClientToolResumeError('These function call outputs were already submitted.');

  return { operationId };
};

/**
 * Run an operation to its next stop. A resumed park takes its first step as
 * the async-tool resume (refresh the tool results, re-enter the model); the
 * rest is the ordinary synchronous loop.
 */
export const executeResponseRun = async (
  agentRuntimeService: AgentRuntimeService,
  run: { operationId: string; resumed?: boolean },
): Promise<AgentState> => {
  if (!run.resumed) return agentRuntimeService.executeSync(run.operationId);

  const state = await agentRuntimeService.getCoordinator().loadAgentState(run.operationId);
  const first = await agentRuntimeService.executeStep({
    operationId: run.operationId,
    resumeAsyncTool: true,
    stepIndex: state?.stepCount ?? 0,
  });
  const nextContext = first.stepResult?.nextContext;
  if (!nextContext) return first.state as AgentState;

  return agentRuntimeService.executeSync(run.operationId, { initialContext: nextContext });
};
