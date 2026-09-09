import type {
  ChatToolPayload,
  MessageMetadata,
  MessageToolCall,
  ModelPerformance,
  ModelReasoning,
  ModelUsage,
} from '@lobechat/types';
import { serializePartsForStorage } from '@lobechat/utils/multimodalContent';
import { sanitizeToolCallArguments } from '@lobechat/utils/sanitizeToolCallArguments';

import { UsageCounter } from '../core/UsageCounter';
import type { AgentRuntimeHost, LLMAttemptOutput } from '../transport';
import type {
  AgentEvent,
  AgentState,
  GeneralAgentCallLLMResultPayload,
  InstructionExecutionResult,
} from '../types';
import {
  hasRepeatedToolCall,
  TOOL_CALL_REPEAT_LIMIT,
  updateToolCallRepeatGuard,
} from '../utils/toolCallRepeatGuard';

export const VISIBLE_OUTPUT_END_PUBLISHED_STEP_INDEX_METADATA_KEY =
  'visibleOutputEndPublishedStepIndex';

type CallLlmCollectedOutput = Pick<
  LLMAttemptOutput,
  | 'content'
  | 'contentParts'
  | 'hasContentImages'
  | 'hasReasoningImages'
  | 'reasoning'
  | 'reasoningParts'
  | 'thinkingContent'
>;

interface CallLlmMessageMetadata extends MessageMetadata {
  answerSalvagedFromReasoning?: boolean;
  interruptedMidStream?: boolean;
}

interface FinalizeCallLlmTurnInput {
  assistantMessageId: string;
  events: AgentEvent[];
  host: AgentRuntimeHost;
  model: string;
  output: LLMAttemptOutput;
  provider: string;
  recordResult?: (output: LLMAttemptOutput) => Promise<void> | void;
  shouldReplayAssistantReasoning: boolean;
  state: AgentState;
  stepLabel?: string;
}

interface PersistInterruptedCallLlmResultInput {
  assistantMessageId: string;
  host: AgentRuntimeHost;
  output: LLMAttemptOutput;
}

const buildMessageMetadata = ({
  answerSalvagedFromReasoning,
  currentStepSpeed,
  currentStepUsage,
  finishType,
  hasContentImages,
  interruptedMidStream,
}: {
  answerSalvagedFromReasoning?: boolean;
  currentStepSpeed?: ModelPerformance;
  currentStepUsage?: ModelUsage;
  finishType?: string;
  hasContentImages?: boolean;
  interruptedMidStream?: boolean;
}): CallLlmMessageMetadata | undefined => {
  const metadata: CallLlmMessageMetadata = {
    ...(currentStepUsage && { ...currentStepUsage, usage: currentStepUsage }),
    ...(currentStepSpeed && { ...currentStepSpeed, performance: currentStepSpeed }),
    ...(finishType && { finishType }),
    ...(hasContentImages && { isMultimodal: true }),
    ...(answerSalvagedFromReasoning && { answerSalvagedFromReasoning: true }),
    ...(interruptedMidStream && { interruptedMidStream: true }),
  };

  return Object.keys(metadata).length > 0 ? metadata : undefined;
};

const buildFinalReasoning = (output: CallLlmCollectedOutput): ModelReasoning | undefined => {
  if (output.hasReasoningImages) {
    return {
      content: serializePartsForStorage(output.reasoningParts),
      isMultimodal: true,
    };
  }

  if (output.reasoning) {
    return {
      ...output.reasoning,
      content: output.thinkingContent || output.reasoning.content,
    };
  }

  return output.thinkingContent ? { content: output.thinkingContent } : undefined;
};

const sanitizePersistedTools = (toolsCalling: ChatToolPayload[]) =>
  toolsCalling.length > 0
    ? toolsCalling.map((tool) => ({
        ...tool,
        arguments: sanitizeToolCallArguments(tool.arguments),
      }))
    : undefined;

const sanitizeStateToolCalls = (toolCalls: MessageToolCall[]) => {
  const sanitizedToolCalls = toolCalls
    .filter((toolCall) => !!toolCall.function.name)
    .map((toolCall) => ({
      ...toolCall,
      function: {
        ...toolCall.function,
        arguments: sanitizeToolCallArguments(toolCall.function.arguments),
      },
    }));

  return sanitizedToolCalls.length > 0 ? sanitizedToolCalls : undefined;
};

interface WorkAnchorMessage {
  children?: WorkAnchorMessage[];
  compressedMessages?: WorkAnchorMessage[];
  id?: string;
  role?: string;
  tool_calls?: unknown[];
  tools?: { result?: { id?: string }; result_msg_id?: string }[];
}

/**
 * Rehydration folds assistant/tool rows into groups. Visit their original IDs
 * in conversation order so a nested source still excludes earlier tool calls.
 * Group-level fields are summaries and must not count as new interactions.
 */
function* visitWorkAnchorMessages(
  messages: WorkAnchorMessage[],
): Generator<{ hasToolInteraction: boolean; id?: string }> {
  for (const message of messages) {
    const members = message.children ?? message.compressedMessages;
    yield {
      hasToolInteraction:
        !members &&
        (message.role === 'tool' || !!message.tool_calls?.length || !!message.tools?.length),
      id: message.id,
    };
    if (members) {
      yield* visitWorkAnchorMessages(members);
    } else {
      for (const tool of message.tools ?? []) {
        const id = tool.result?.id ?? tool.result_msg_id;
        if (id) yield { hasToolInteraction: true, id };
      }
    }
  }
}

/**
 * Stamp only the final assistant response after tool interaction in this turn.
 * The source boundary prevents historical tools from anchoring plain answers.
 */
const buildWorkAnchor = ({
  operationId,
  output,
  state,
}: {
  operationId: string;
  output: LLMAttemptOutput;
  state: AgentState;
}): MessageMetadata['work'] => {
  if (output.toolsCalling.length > 0 || output.toolCalls.length > 0) return undefined;

  const sourceMessageId = state.metadata?.sourceMessageId;
  if (typeof sourceMessageId !== 'string') return undefined;

  let sourceFound = false;
  let hasPriorToolInteraction = false;
  for (const message of visitWorkAnchorMessages(state.messages)) {
    if (sourceFound && message.hasToolInteraction) {
      hasPriorToolInteraction = true;
      break;
    }
    if (message.id === sourceMessageId) sourceFound = true;
  }
  if (!hasPriorToolInteraction) return undefined;

  return {
    rootOperationId: operationId,
    userMessageId: sourceMessageId,
  };
};

const persistFinalMessage = async ({
  assistantMessageId,
  host,
  output,
  state,
}: Pick<FinalizeCallLlmTurnInput, 'assistantMessageId' | 'host' | 'output' | 'state'>) => {
  const finalContent = output.hasContentImages
    ? serializePartsForStorage(output.contentParts)
    : output.content;
  const finalReasoning = buildFinalReasoning(output);
  const metadata = buildMessageMetadata({
    answerSalvagedFromReasoning: output.answerSalvagedFromReasoning,
    currentStepSpeed: output.speed,
    currentStepUsage: output.usage,
    finishType: output.finishReason,
    hasContentImages: output.hasContentImages,
  });
  const workAnchor = buildWorkAnchor({
    operationId: host.operation.operationId,
    output,
    state,
  });

  try {
    await host.transports.messages.update(assistantMessageId, {
      content: finalContent,
      imageList: output.imageList.length > 0 ? output.imageList : undefined,
      metadata: workAnchor ? { ...metadata, work: workAnchor } : metadata,
      observationId: output.observationId,
      reasoning: finalReasoning,
      search: output.grounding,
      tools: sanitizePersistedTools(output.toolsCalling),
      traceId: output.traceId,
    });
  } catch (error) {
    console.error('[call_llm] Failed to update message:', error);
  }

  return finalReasoning;
};

const buildFinalState = ({
  assistantMessageId,
  model,
  output,
  provider,
  shouldReplayAssistantReasoning,
  state,
  stepLabel,
  toolCallRepeatGuard,
  visibleOutputEndPublishedStepIndex,
  finalReasoning,
}: Omit<FinalizeCallLlmTurnInput, 'events' | 'host' | 'recordResult'> & {
  finalReasoning?: ModelReasoning;
  toolCallRepeatGuard: NonNullable<AgentState['toolCallRepeatGuard']>;
  visibleOutputEndPublishedStepIndex?: number;
}): AgentState => {
  const newState = structuredClone(state);
  newState.toolCallRepeatGuard = toolCallRepeatGuard;
  newState.messages.push({
    content: output.content,
    id: assistantMessageId,
    model,
    provider,
    reasoning: shouldReplayAssistantReasoning ? finalReasoning : undefined,
    role: 'assistant',
    tool_calls: sanitizeStateToolCalls(output.toolCalls),
  });

  if (output.usage) {
    const { usage, cost } = UsageCounter.accumulateLLM({
      cost: newState.cost,
      model,
      modelUsage: output.usage,
      provider,
      usage: newState.usage,
    });

    newState.usage = usage;
    if (cost) newState.cost = cost;
  }

  if (stepLabel || visibleOutputEndPublishedStepIndex !== undefined) {
    const stateMetadata = { ...newState.metadata };
    if (stepLabel) stateMetadata._stepLabel = stepLabel;
    if (visibleOutputEndPublishedStepIndex !== undefined) {
      stateMetadata[VISIBLE_OUTPUT_END_PUBLISHED_STEP_INDEX_METADATA_KEY] =
        visibleOutputEndPublishedStepIndex;
    }
    newState.metadata = stateMetadata;
  }

  return newState;
};

export const finalizeCallLlmTurn = async ({
  assistantMessageId,
  events,
  host,
  model,
  output,
  provider,
  recordResult,
  shouldReplayAssistantReasoning,
  state,
  stepLabel,
}: FinalizeCallLlmTurnInput): Promise<InstructionExecutionResult> => {
  const { operation, transports } = host;
  const toolCallRepeatGuard = updateToolCallRepeatGuard(
    state.toolCallRepeatGuard,
    output.toolsCalling,
  );
  const finalizedOutput =
    output.finishReason !== 'abort' && hasRepeatedToolCall(toolCallRepeatGuard)
      ? {
          ...output,
          content: `Stopped after the same tool call was requested ${TOOL_CALL_REPEAT_LIMIT} consecutive times.`,
          finishReason: 'tool_call_repeat_limit',
          toolCalls: [],
          toolsCalling: [],
        }
      : output;

  events.push({
    result: {
      content: finalizedOutput.content,
      finishReason: finalizedOutput.finishReason,
      reasoning: finalizedOutput.thinkingContent,
      tool_calls: finalizedOutput.toolCalls,
      usage: finalizedOutput.usage,
    },
    type: 'llm_result',
  });

  await transports.stream.publishEvent({
    data: {
      finalContent: finalizedOutput.content,
      grounding: finalizedOutput.grounding,
      ...(stepLabel && { stepLabel }),
      imageList: finalizedOutput.imageList.length > 0 ? finalizedOutput.imageList : undefined,
      reasoning: finalizedOutput.thinkingContent || undefined,
      toolsCalling: finalizedOutput.toolsCalling,
      usage: finalizedOutput.usage,
    },
    stepIndex: operation.stepIndex,
    type: 'stream_end',
  });

  let visibleOutputEndPublishedStepIndex: number | undefined;
  const canPublishEarlyFinalAnswerVisibleEnd =
    operation.allowEarlyFinalAnswerVisibleOutputEnd ?? true;
  if (
    canPublishEarlyFinalAnswerVisibleEnd &&
    finalizedOutput.finishReason !== 'abort' &&
    finalizedOutput.toolsCalling.length === 0 &&
    finalizedOutput.toolCalls.length === 0
  ) {
    try {
      await transports.stream.publishEvent({
        data: { reason: 'final_answer' },
        stepIndex: operation.stepIndex,
        type: 'visible_output_end',
      });
      visibleOutputEndPublishedStepIndex = operation.stepIndex;
    } catch (error) {
      console.error('Failed to publish visible_output_end:', error);
    }
  }

  const finalReasoning = await persistFinalMessage({
    assistantMessageId,
    host,
    output: finalizedOutput,
    state,
  });
  const newState = buildFinalState({
    assistantMessageId,
    finalReasoning,
    model,
    output: finalizedOutput,
    provider,
    shouldReplayAssistantReasoning,
    state,
    stepLabel,
    toolCallRepeatGuard,
    visibleOutputEndPublishedStepIndex,
  });

  await recordResult?.(finalizedOutput);

  if (finalizedOutput.finishReason === 'abort') {
    return {
      events,
      newState,
      nextContext: {
        payload: {
          hasToolsCalling: finalizedOutput.toolsCalling.length > 0,
          parentMessageId: assistantMessageId,
          reason: 'user_cancelled',
          result: { content: finalizedOutput.content, tool_calls: finalizedOutput.toolCalls },
          toolsCalling: finalizedOutput.toolsCalling,
        },
        phase: 'human_abort',
        session: {
          eventCount: events.length,
          messageCount: newState.messages.length,
          sessionId: operation.operationId,
          status: 'running',
          stepCount: state.stepCount + 1,
        },
        stepUsage: finalizedOutput.usage,
      },
    };
  }

  return {
    events,
    newState,
    nextContext: {
      payload: {
        hasToolsCalling: finalizedOutput.toolsCalling.length > 0,
        parentMessageId: assistantMessageId,
        result: { content: finalizedOutput.content, tool_calls: finalizedOutput.toolCalls },
        toolsCalling: finalizedOutput.toolsCalling,
      } as GeneralAgentCallLLMResultPayload,
      phase: 'llm_result',
      session: {
        eventCount: events.length,
        messageCount: newState.messages.length,
        sessionId: operation.operationId,
        status: 'running',
        stepCount: state.stepCount + 1,
      },
      stepUsage: finalizedOutput.usage,
    },
  };
};

export const persistInterruptedCallLlmResult = async ({
  assistantMessageId,
  host,
  output,
}: PersistInterruptedCallLlmResultInput): Promise<void> => {
  if (!output.content && !output.thinkingContent && output.toolsCalling.length === 0) return;

  try {
    await host.transports.messages.update(assistantMessageId, {
      content: output.content,
      metadata: buildMessageMetadata({
        currentStepSpeed: output.speed,
        currentStepUsage: output.usage,
        interruptedMidStream: true,
      }),
      reasoning: output.thinkingContent ? { content: output.thinkingContent } : undefined,
      tools: sanitizePersistedTools(output.toolsCalling),
    });
  } catch (error) {
    console.error('[call_llm] Failed to persist interrupted output:', error);
  }
};
