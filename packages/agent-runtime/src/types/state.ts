/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
import type { AgentEvent } from './event';

/**
 * Agent's serializable state.
 * This is the "passport" that can be persisted and transferred.
 */
export interface AgentState {
  sessionId: string;
  // --- State Machine ---
  status: 'idle' | 'running' | 'waiting_for_human_input' | 'done' | 'error';

  // --- Core Context ---
  messages: any[];
  systemRole?: string;

  // --- Event History ---
  /**
   * Complete event trace for this agent session.
   * Useful for debugging, auditing, and state replay.
   */
  events: AgentEvent[];

  // --- Execution Tracking ---
  /**
   * Number of execution steps in this session.
   * Incremented on each runtime.step() call.
   */
  stepCount: number;
  /**
   * Optional maximum number of steps allowed.
   * If set, execution will stop with error when exceeded.
   */
  maxSteps?: number;

  // --- HIL ---
  /**
   * When status is 'waiting_for_human_input', this stores pending requests
   * for human-in-the-loop operations.
   */
  pendingToolsCalling?: ToolsCalling[];
  pendingHumanPrompt?: { metadata?: Record<string, unknown>; prompt: string };
  pendingHumanSelect?: {
    metadata?: Record<string, unknown>;
    multi?: boolean;
    options: Array<{ label: string; value: string }>;
    prompt?: string;
  };

  // --- Metadata ---
  createdAt: string;
  error?: any;
  lastModified: string;
  // --- Extensible metadata ---
  metadata?: Record<string, any>;
}

/**
 * OpenAI Tool Call
 */
export interface ToolsCalling {
  function: {
    arguments: string;
    name: string; // A JSON string of arguments
  };
  id: string;
  type: 'function';
}

/**
 * A registry for tools, mapping tool names to their implementation.
 */
export type ToolRegistry = Record<string, (args: any) => Promise<any>>;
