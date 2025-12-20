/**
 * Runtime Step Context Types
 *
 * Step Context is computed at the beginning of each Agent Runtime step
 * and injected into Context Engine and Tool Executors.
 *
 * Key principles:
 * 1. Computed by the caller (AgentRuntime), not by Context Engine or Executor
 * 2. Executors read from stepContext, return new state via result.state
 * 3. Replaces the deprecated pluginState passing pattern
 */

/**
 * Todo item structure
 * Duplicated here to avoid circular dependency with builtin-tool-gtd
 */
export interface StepContextTodoItem {
  completed: boolean;
  text: string;
}

/**
 * Todo list structure in step context
 */
export interface StepContextTodos {
  items: StepContextTodoItem[];
  updatedAt: string;
}

/**
 * Runtime Step Context
 *
 * Contains dynamically computed state that changes between steps.
 * Computed from messages at the beginning of each step.
 *
 * @example
 * ```typescript
 * const stepContext = computeStepContext(state);
 * // Pass to Context Engine
 * messagesEngine.process({ messages, stepContext });
 * // Pass to Executor
 * executor.invoke(params, { stepContext, messageId, ... });
 * ```
 */
export interface RuntimeStepContext {
  /**
   * Current todo list state
   * Computed from the latest GTD tool message in the conversation
   */
  todos?: StepContextTodos;

  // Future extensions:
  // plan: StepContextPlan | null;
}
