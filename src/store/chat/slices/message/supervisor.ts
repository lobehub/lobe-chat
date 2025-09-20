import { groupChatPrompts, groupSupervisorPrompts } from '@lobechat/prompts';
import { ChatMessage, GroupMemberWithAgent } from '@lobechat/types';

import { chatService } from '@/services/chat';

export interface SupervisorDecision {
  id: string;
  // target agent ID or "user" for DM, omit for group message
  instruction?: string;
  // agent ID who should respond
  target?: string; // optional instruction from supervisor to the agent
}

export type SupervisorDecisionList = SupervisorDecision[]; // Empty array = stop conversation

export interface SupervisorTodoItem {
  content: string;
  finished: boolean;
}

export interface SupervisorDecisionResult {
  decisions: SupervisorDecisionList;
  todoUpdated: boolean;
  todos: SupervisorTodoItem[];
}

export type SupervisorToolName = 'create_todo' | 'finish_todo' | 'trigger_agent';

export interface SupervisorToolCall {
  parameter?: unknown;
  tool_name: SupervisorToolName;
}

export interface SupervisorContext {
  abortController?: AbortController;
  allowDM?: boolean;
  availableAgents: GroupMemberWithAgent[];
  groupId: string;
  messages: ChatMessage[];
  model: string;
  provider: string;
  systemPrompt?: string;
  todoList?: SupervisorTodoItem[];
  userName?: string;
}

/**
 * Core supervisor runtime that orchestrates the conversation between agents in group chat
 */
export class GroupChatSupervisor {
  /**
   * Make decision on who should speak next
   */
  async makeDecision(context: SupervisorContext): Promise<SupervisorDecisionResult> {
    const { messages, availableAgents, userName, systemPrompt, allowDM, todoList } = context;

    // If no agents available, stop conversation
    if (availableAgents.length === 0) {
      return { decisions: [], todoUpdated: false, todos: [] };
    }

    try {
      // Create supervisor prompt with conversation context
      const conversationHistory = groupSupervisorPrompts(messages);

      const supervisorPrompt = groupChatPrompts.buildSupervisorPrompt({
        allowDM,
        availableAgents: availableAgents
          .filter((agent) => agent.id)
          .map((agent) => ({ id: agent.id!, title: agent.title })),
        conversationHistory,
        systemPrompt,
        todoList,
        userName,
      });

      const response = await this.callLLMForDecision(supervisorPrompt, context);
      const result = this.parseSupervisorResponse(response, availableAgents, context);

      console.log('Supervisor TODO list:', result.todos);

      return result;
    } catch (error) {
      // Re-throw the error so it can be caught and displayed to the user via toast
      throw new Error(
        `Supervisor decision failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Call LLM service to get supervisor decision
   */
  private async callLLMForDecision(
    prompt: string,
    context: SupervisorContext,
  ): Promise<SupervisorToolCall[] | string> {
    const supervisorConfig = {
      model: context.model,
      provider: context.provider,
      temperature: 0.3,
    };

    try {
      // TODO: Replace with structured ouput @Arvin
      return this.callLLMForDecisionWithStreaming(prompt, context, supervisorConfig);

      // const response = await chatService.getStructuredCompletion<SupervisorToolCall[]>(
      //   {
      //     messages: [{ content: prompt, role: 'user' }],
      //     response_format: responseFormat,
      //     stream: false,
      //     ...supervisorConfig,
      //   },
      //   {
      //     signal: context.abortController?.signal,
      //   },
      // );

      // return response;
    } catch (err) {
      if (this.isAbortError(err, context)) {
        throw this.createAbortError();
      }

      console.error('Supervisor LLM error:', err);
      throw err instanceof Error ? err : new Error(String(err));
    }
  }

  private createAbortError() {
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    return abortError;
  }

  private isAbortError(error: unknown, context: SupervisorContext) {
    if (context.abortController?.signal.aborted) return true;

    const name = (error as DOMException)?.name;

    return name === 'AbortError';
  }

  private async callLLMForDecisionWithStreaming(
    prompt: string,
    context: SupervisorContext,
    supervisorConfig: {
      model: string;
      provider: string;
      temperature: number;
    },
  ) {
    let res = '';
    let error: Error | null = null;

    await chatService.fetchPresetTaskResult({
      abortController: context.abortController,
      onError: (err) => {
        console.error('Supervisor LLM error (fallback):', err);
        error = err;
      },
      onFinish: async (content) => {
        console.log('Supervisor LLM response (fallback):', content);
        res = content.trim();
      },
      onLoadingChange: (loading) => {
        console.log('Supervisor LLM loading state (fallback):', loading);
      },
      params: {
        messages: [{ content: prompt, role: 'user' }],
        stream: false,
        ...supervisorConfig,
      },
    });

    if (context.abortController?.signal.aborted) {
      throw this.createAbortError();
    }

    if (error) {
      throw error;
    }

    if (!res) {
      throw this.createAbortError();
    }

    return res;
  }

  private parseSupervisorResponse(
    response: SupervisorToolCall[] | string,
    availableAgents: GroupMemberWithAgent[],
    context: SupervisorContext,
  ): SupervisorDecisionResult {
    const previousTodos = (context.todoList || []).map((item) => ({ ...item }));
    let primaryError: unknown = null;

    try {
      const toolCalls = this.normalizeToolCalls(response);
      return this.processToolCalls(toolCalls, previousTodos, availableAgents, context);
    } catch (error) {
      primaryError = error;
    }

    try {
      const todos = this.extractLegacyTodoList(response, previousTodos);
      const decisions = this.parseLegacyDecisions(response, availableAgents);
      return { decisions, todoUpdated: false, todos };
    } catch (legacyError) {
      const primaryMessage =
        primaryError instanceof Error && primaryError.message === '__LEGACY_FORMAT__'
          ? 'legacy format detected'
          : primaryError instanceof Error
            ? primaryError.message
            : String(primaryError);
      const legacyMessage =
        legacyError instanceof Error ? legacyError.message : String(legacyError);

      throw new Error(`Failed to parse supervisor response: ${primaryMessage} | ${legacyMessage}`);
    }
  }

  private normalizeToolCalls(response: SupervisorToolCall[] | string): SupervisorToolCall[] {
    const sanitizeList = (items: unknown): SupervisorToolCall[] => {
      if (!Array.isArray(items)) return [];
      return items
        .map((item) => this.sanitizeToolCall(item))
        .filter((item): item is SupervisorToolCall => !!item);
    };

    if (Array.isArray(response)) {
      return sanitizeList(response);
    }

    if (typeof response === 'string') {
      const parsed = this.tryParseJson(response);

      if (Array.isArray(parsed)) {
        return sanitizeList(parsed);
      }

      if (parsed && typeof parsed === 'object') {
        const toolCalls = (parsed as { tool_calls?: unknown }).tool_calls;
        if (Array.isArray(toolCalls)) {
          return sanitizeList(toolCalls);
        }

        if ('decisions' in parsed || 'todos' in parsed) {
          throw new Error('__LEGACY_FORMAT__');
        }

        const singleCall = this.sanitizeToolCall(parsed);
        if (singleCall) {
          return [singleCall];
        }
      }

      const fallbackArray = this.extractJsonArrayFromString(response);
      if (Array.isArray(fallbackArray)) {
        return sanitizeList(fallbackArray);
      }

      throw new Error('No tool calls array found in response');
    }

    throw new Error('Unsupported supervisor response format');
  }

  private sanitizeToolCall(raw: any): SupervisorToolCall | null {
    if (!raw) return null;

    const functionCallName =
      typeof raw?.function === 'object' && typeof raw?.function?.name === 'string'
        ? raw.function.name
        : null;

    const potentialName =
      typeof raw.tool_code === 'string'
        ? raw.tool_code
        : typeof raw.toolCode === 'string'
          ? raw.toolCode
          : typeof raw.tool_name === 'string'
            ? raw.tool_name
            : typeof raw.toolName === 'string'
              ? raw.toolName
              : typeof raw.tool === 'string'
                ? raw.tool
                : typeof raw.name === 'string'
                  ? raw.name
                  : functionCallName;

    if (!potentialName) return null;

    const normalizedName = potentialName
      .trim()
      .toLowerCase()
      .replaceAll(/[\s-]+/g, '_');
    if (!['create_todo', 'finish_todo', 'trigger_agent'].includes(normalizedName)) {
      return null;
    }

    let parameter: unknown;

    if (raw.parameter !== undefined) parameter = raw.parameter;
    else if (raw.parameters !== undefined) parameter = raw.parameters;
    else if (raw.args !== undefined) parameter = raw.args;
    else if (raw.arguments !== undefined) parameter = raw.arguments;
    else if (raw.function && 'arguments' in raw.function) parameter = raw.function.arguments;

    if (typeof parameter === 'string') {
      const parsedParameter = this.tryParseJson(parameter);
      if (parsedParameter !== undefined) {
        parameter = parsedParameter;
      }
    }

    return {
      parameter,
      tool_name: normalizedName as SupervisorToolName,
    };
  }

  private processToolCalls(
    toolCalls: SupervisorToolCall[],
    previousTodos: SupervisorTodoItem[],
    availableAgents: GroupMemberWithAgent[],
    context: SupervisorContext,
  ): SupervisorDecisionResult {
    if (toolCalls.length === 0) {
      return { decisions: [], todoUpdated: false, todos: previousTodos };
    }

    const todos = previousTodos.map((todo) => ({ ...todo }));
    const decisions: SupervisorDecisionList = [];
    let todoUpdated = false;

    toolCalls.forEach((call) => {
      switch (call.tool_name) {
        case 'create_todo': {
          const changed = this.applyCreateTodo(todos, call.parameter);
          todoUpdated = todoUpdated || changed;
          break;
        }
        case 'finish_todo': {
          const changed = this.applyFinishTodo(todos, call.parameter);
          todoUpdated = todoUpdated || changed;
          break;
        }
        case 'trigger_agent': {
          const decision = this.buildDecisionFromTool(call.parameter, availableAgents, context);
          if (decision) {
            decisions.push(decision);
          }
          break;
        }
      }
    });

    return { decisions, todoUpdated, todos };
  }

  private applyCreateTodo(targetTodos: SupervisorTodoItem[], parameter: unknown): boolean {
    if (Array.isArray(parameter)) {
      return parameter.reduce((acc, item) => this.applyCreateTodo(targetTodos, item) || acc, false);
    }

    const content = this.extractTodoContent(parameter);
    if (!content) return false;

    const exists = targetTodos.some(
      (todo) => todo.content.trim().toLowerCase() === content.toLowerCase() && !todo.finished,
    );

    if (exists) return false;

    targetTodos.push({ content, finished: false });
    return true;
  }

  private extractTodoContent(parameter: unknown): string | null {
    if (typeof parameter === 'string') {
      const trimmed = parameter.trim();
      return trimmed ? trimmed : null;
    }

    if (!parameter || typeof parameter !== 'object') return null;

    const payload = parameter as Record<string, unknown>;
    const candidates: unknown[] = [
      payload.content,
      payload.title,
      payload.task,
      payload.text,
      payload.message,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim()) {
        return candidate.trim();
      }
    }

    return null;
  }

  private applyFinishTodo(targetTodos: SupervisorTodoItem[], parameter: unknown): boolean {
    if (Array.isArray(parameter)) {
      return parameter.reduce((acc, item) => this.applyFinishTodo(targetTodos, item) || acc, false);
    }

    if (parameter === false) return false;

    if (parameter === true || parameter === undefined || parameter === null) {
      return this.finishNextUnfinished(targetTodos);
    }

    if (typeof parameter === 'number') {
      return this.finishTodoByIndex(targetTodos, parameter);
    }

    if (typeof parameter === 'string') {
      return this.finishTodoByContent(targetTodos, parameter);
    }

    if (typeof parameter === 'object') {
      const payload = parameter as Record<string, unknown>;

      if ('all' in payload && payload.all === true) {
        let updated = false;
        targetTodos.forEach((todo) => {
          if (!todo.finished) {
            todo.finished = true;
            updated = true;
          }
        });
        return updated;
      }

      let handled = false;
      let updated = false;

      if ('index' in payload && typeof payload.index === 'number') {
        updated = this.finishTodoByIndex(targetTodos, payload.index) || updated;
        handled = true;
      }

      if ('indices' in payload && Array.isArray(payload.indices)) {
        payload.indices.forEach((idx) => {
          if (typeof idx === 'number') {
            updated = this.finishTodoByIndex(targetTodos, idx) || updated;
          }
        });
        handled = true;
      }

      if ('content' in payload && typeof payload.content === 'string') {
        updated = this.finishTodoByContent(targetTodos, payload.content) || updated;
        handled = true;
      }

      if ('contents' in payload && Array.isArray(payload.contents)) {
        payload.contents.forEach((item) => {
          if (typeof item === 'string') {
            updated = this.finishTodoByContent(targetTodos, item) || updated;
          }
        });
        handled = true;
      }

      if ('next' in payload && payload.next === true) {
        updated = this.finishNextUnfinished(targetTodos) || updated;
        handled = true;
      }

      if (!handled) {
        updated = this.finishNextUnfinished(targetTodos) || updated;
      }

      return updated;
    }

    return this.finishNextUnfinished(targetTodos);
  }

  private finishNextUnfinished(targetTodos: SupervisorTodoItem[]): boolean {
    const todo = targetTodos.find((item) => !item.finished);
    if (!todo) return false;
    todo.finished = true;
    return true;
  }

  private finishTodoByIndex(targetTodos: SupervisorTodoItem[], index: number): boolean {
    if (!Number.isInteger(index)) return false;
    if (index < 0 || index >= targetTodos.length) return false;
    if (targetTodos[index].finished) return false;
    targetTodos[index].finished = true;
    return true;
  }

  private finishTodoByContent(targetTodos: SupervisorTodoItem[], content: string): boolean {
    const normalizedContent = content.trim().toLowerCase();
    if (!normalizedContent) return false;

    const exactMatch = targetTodos.find(
      (todo) => todo.content.trim().toLowerCase() === normalizedContent,
    );
    if (exactMatch) {
      if (exactMatch.finished) return false;
      exactMatch.finished = true;
      return true;
    }

    const partialMatch = targetTodos.find((todo) =>
      todo.content.toLowerCase().includes(normalizedContent),
    );
    if (!partialMatch || partialMatch.finished) return false;
    partialMatch.finished = true;
    return true;
  }

  private buildDecisionFromTool(
    parameter: unknown,
    availableAgents: GroupMemberWithAgent[],
    context: SupervisorContext,
  ): SupervisorDecision | null {
    if (typeof parameter === 'string') {
      return this.createDecisionFromPayload({ id: parameter }, availableAgents, context);
    }

    if (!parameter || typeof parameter !== 'object') return null;

    return this.createDecisionFromPayload(
      parameter as Record<string, unknown>,
      availableAgents,
      context,
    );
  }

  private createDecisionFromPayload(
    payload: Record<string, unknown>,
    availableAgents: GroupMemberWithAgent[],
    context: SupervisorContext,
  ): SupervisorDecision | null {
    const idValue =
      typeof payload.id === 'string'
        ? payload.id
        : typeof payload.agentId === 'string'
          ? payload.agentId
          : typeof payload.speaker === 'string'
            ? payload.speaker
            : undefined;
    if (!idValue) return null;

    const agentExists = availableAgents.some((agent) => agent.id === idValue);
    if (!agentExists) return null;

    const instruction =
      typeof payload.instruction === 'string'
        ? payload.instruction
        : typeof payload.message === 'string'
          ? payload.message
          : undefined;

    const potentialTargets = [payload.target, payload.recipient, payload.to];
    let target: string | undefined;
    for (const candidate of potentialTargets) {
      if (typeof candidate === 'string') {
        target = candidate;
        break;
      }
    }

    if (target && target !== 'user') {
      const targetExists = availableAgents.some((agent) => agent.id === target);
      if (!targetExists) target = undefined;
    }

    if (context.allowDM === false) {
      target = undefined;
    }

    return {
      id: idValue,
      instruction,
      target: target || undefined,
    };
  }

  private parseLegacyDecisions(
    response: SupervisorToolCall[] | string,
    availableAgents: GroupMemberWithAgent[],
  ): SupervisorDecisionList {
    try {
      const decisions = this.normalizeLegacyDecisions(response);

      if (!Array.isArray(decisions)) {
        throw new Error('Response must include a decisions array');
      }

      if (decisions.length === 0) {
        return [];
      }

      return decisions
        .filter(
          (item: any) =>
            typeof item === 'object' &&
            item !== null &&
            typeof item.id === 'string' &&
            availableAgents.some((agent) => agent.id === item.id),
        )
        .map((item: any) => ({
          id: item.id,
          instruction: typeof item.instruction === 'string' ? item.instruction : undefined,
          target: typeof item.target === 'string' ? item.target : undefined,
        }));
    } catch (error) {
      throw new Error(
        `Failed to parse supervisor decision: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private normalizeLegacyDecisions(response: SupervisorToolCall[] | string) {
    if (typeof response === 'string') {
      const parsed = this.extractJsonObjectFromString(response);

      if (Array.isArray(parsed)) return parsed;
      if (parsed && Array.isArray((parsed as any).decisions)) return (parsed as any).decisions;

      const decisionsArray = this.extractJsonArrayFromString(response);
      if (!Array.isArray(decisionsArray)) {
        throw new Error('No JSON array found in response');
      }

      return decisionsArray;
    }

    if (response && typeof response === 'object' && !Array.isArray(response)) {
      const decisions = (response as { decisions?: unknown }).decisions;
      if (Array.isArray(decisions)) return decisions;
    }

    return null;
  }

  private extractLegacyTodoList(
    response: SupervisorToolCall[] | string,
    previousTodos: SupervisorTodoItem[],
  ): SupervisorTodoItem[] {
    const normalize = (items: unknown): SupervisorTodoItem[] | undefined => {
      if (items === undefined) return undefined;
      if (!Array.isArray(items)) return [];

      return items
        .filter(
          (item): item is SupervisorTodoItem =>
            typeof item === 'object' &&
            item !== null &&
            typeof (item as any).content === 'string' &&
            typeof (item as any).finished === 'boolean',
        )
        .map((item) => ({
          content: (item as SupervisorTodoItem).content,
          finished: (item as SupervisorTodoItem).finished,
        }));
    };

    if (typeof response === 'string') {
      const parsed = this.extractJsonObjectFromString(response);
      if (parsed) {
        const normalized = normalize((parsed as { todos?: unknown }).todos);
        if (normalized !== undefined) return normalized;
      }

      return previousTodos;
    }

    if (response && typeof response === 'object' && !Array.isArray(response)) {
      const normalized = normalize((response as { todos?: unknown }).todos);
      if (normalized !== undefined) return normalized;
    }

    return previousTodos;
  }

  private tryParseJson(value: string): unknown {
    if (!value) return undefined;

    let parsed: unknown;
    try {
      parsed = JSON.parse(value);
    } catch {
      parsed = undefined;
    }

    if (parsed !== undefined) return parsed;

    const objectResult = this.extractJsonObjectFromString(value);
    if (objectResult !== null) return objectResult;

    return this.extractJsonArrayFromString(value) ?? undefined;
  }

  private extractJsonObjectFromString(response: string) {
    const trimmed = response.trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      parsed = undefined;
    }

    if (parsed && typeof parsed === 'object') {
      return parsed;
    }

    const startIndex = response.indexOf('{');
    const endIndex = response.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
      return null;
    }

    const jsonText = response.slice(startIndex, endIndex + 1);

    try {
      return JSON.parse(jsonText);
    } catch {
      return null;
    }
  }

  private extractJsonArrayFromString(response: string) {
    const startIndex = response.indexOf('[');
    const endIndex = response.lastIndexOf(']');
    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
      return null;
    }

    const jsonText = response.slice(startIndex, endIndex + 1);
    try {
      return JSON.parse(jsonText);
    } catch (error) {
      console.error('Failed to parse JSON array from supervisor response:', error);
      return null;
    }
  }

  /**
   * Quick validation of decision against group rules
   */
  validateDecision(decisions: SupervisorDecisionList, context: SupervisorContext): boolean {
    const { availableAgents } = context;

    // Empty array is always valid (means stop)
    if (decisions.length === 0) return true;

    return decisions.every((decision) => {
      // Validate speaker exists
      const speakerExists = availableAgents.some((agent) => agent.id === decision.id);
      if (!speakerExists) return false;

      // Validate target exists if specified
      if (decision.target) {
        return (
          decision.target === 'user' ||
          availableAgents.some((agent) => agent.id === decision.target)
        );
      }

      return true;
    });
  }
}
