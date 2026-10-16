import type { AgentState } from '@lobechat/agent-runtime';
import type { ChatToolPayload } from '@lobechat/types';

import { AgentOperationModel } from '@/database/models/agentOperation';
import { MessageModel } from '@/database/models/message';
import { TopicModel } from '@/database/models/topic';
import type { LobeChatDatabase } from '@/database/type';
import type { AgentRuntimeService } from '@/server/services/agentRuntime';

import type { FunctionCallOutputItem, OutputItem } from '../types/responses.type';

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

/**
 * The assistant message that issued `callId`, which its result row hangs off.
 * A parked state is usually saved without its messages; the last model call's
 * assistant (`workAssistantMessageId`) is then the one that made the calls.
 */
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
}: ResumeParams): Promise<{ callIds: string[]; operationId: string } | undefined> => {
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

  return { callIds: pending.map((tool) => tool.id), operationId };
};

/**
 * Narrow a resumed run's messages to the turn this response produced, in the
 * raw shape output items are built from. The resume reloads the conversation
 * from the database as display groups (`assistantGroup` with `children`), and
 * everything up to the answered calls was already returned by the response
 * that asked for them; returning those calls again would ask the caller to run
 * its tools a second time.
 */
const withResumedTurn = (state: AgentState, callIds: string[] = []): AgentState => {
  if (!state?.messages?.length) return state;

  const answered = new Set(callIds);
  const flat = state.messages.flatMap((message: any) =>
    message.role === 'assistantGroup'
      ? (message.children ?? []).map((child: any) => ({ ...child, role: 'assistant' }))
      : [message],
  );
  const callsOf = (message: any): { id?: string }[] => message.tool_calls ?? message.tools ?? [];
  const resumeIndex = flat.findLastIndex((message: any) =>
    callsOf(message).some((call) => !!call.id && answered.has(call.id)),
  );
  if (resumeIndex === -1) return state;

  const messages = flat.slice(resumeIndex + 1).map((message: any) =>
    message.tools
      ? {
          content: message.content,
          id: message.id,
          role: message.role,
          tool_calls: message.tools.map((tool: any) => ({
            function: { arguments: tool.arguments, name: `${tool.identifier}____${tool.apiName}` },
            id: tool.id,
            type: 'function',
          })),
        }
      : message,
  );
  return { ...state, messages };
};

/**
 * Run an operation to its next stop. A resumed park takes its first step as
 * the async-tool resume (refresh the tool results, re-enter the model); the
 * rest is the ordinary synchronous loop.
 */
export const executeResponseRun = async (
  agentRuntimeService: AgentRuntimeService,
  run: { callIds?: string[]; operationId: string; resumed?: boolean },
): Promise<AgentState> => {
  if (!run.resumed) return agentRuntimeService.executeSync(run.operationId);

  const state = await agentRuntimeService.getCoordinator().loadAgentState(run.operationId);
  const first = await agentRuntimeService.executeStep({
    operationId: run.operationId,
    resumeAsyncTool: true,
    stepIndex: state?.stepCount ?? 0,
  });
  // Stopped already (answered, or parked again): nothing is left to run, and
  // executeSync would hand back the saved state rather than this step's.
  const nextContext = first.stepResult?.nextContext;
  if (!nextContext || first.state?.status !== 'running')
    return withResumedTurn(first.state as AgentState, run.callIds);

  const final = await agentRuntimeService.executeSync(run.operationId, {
    initialContext: nextContext,
  });
  return withResumedTurn(final, run.callIds);
};

/**
 * The function calls a run parked on, as output items the caller can answer.
 * A parked state is saved without its messages, so the calls cannot be read
 * back from them; without these items a non-streaming caller gets an
 * `incomplete` response with no `call_id` to send outputs for.
 */
export const pendingFunctionCallItems = (
  state: AgentState,
  output: OutputItem[],
  responseId: string,
): OutputItem[] => {
  const listed = new Set(output.map((item) => (item as { call_id?: string }).call_id));
  return ((state.pendingToolsCalling ?? []) as ChatToolPayload[])
    .filter((tool) => !listed.has(tool.id))
    .map((tool, index) => ({
      arguments: tool.arguments || '{}',
      call_id: tool.id,
      id: `fc_${responseId}_pending_${index}`,
      name: tool.apiName,
      status: 'completed' as const,
      type: 'function_call' as const,
    }));
};
