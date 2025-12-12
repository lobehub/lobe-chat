/**
 * API names for Group Management tool
 */
export const GroupManagementApiName = {
  // ==================== Member Management ====================
  /** Search for agents that can be invited to the group */
  searchAgent: 'searchAgent',
  /** Invite an agent to join the group */
  inviteAgent: 'inviteAgent',
  /** Create a new agent and add it to the group */
  createAgent: 'createAgent',
  /** Remove an agent from the group */
  removeAgent: 'removeAgent',
  /** Get detailed information about an agent */
  getAgentInfo: 'getAgentInfo',

  // ==================== Communication Coordination ====================
  /** Let a specific agent speak (synchronous, immediate response) */
  speak: 'speak',
  /** Let multiple agents speak simultaneously (parallel responses) */
  broadcast: 'broadcast',
  /** Delegate the conversation to a specific agent (supervisor exits) */
  delegate: 'delegate',

  // ==================== Task Execution ====================
  /** Let an agent execute a task asynchronously */
  executeTask: 'executeTask',
  /** Interrupt a running agent task */
  interrupt: 'interrupt',

  // ==================== Context Management ====================
  /** Summarize and compress the current conversation context */
  summarize: 'summarize',

  // ==================== Flow Control ====================
  /** Define a multi-agent collaboration workflow */
  createWorkflow: 'createWorkflow',
  /** Let multiple agents vote on a decision */
  vote: 'vote',
} as const;

export type GroupManagementApiNameType =
  (typeof GroupManagementApiName)[keyof typeof GroupManagementApiName];

/**
 * Types for agent search results
 */
export interface AgentSearchResult {
  id: string;
  title: string;
  description?: string;
  avatar?: string;
  source: 'user' | 'community';
}

/**
 * Types for workflow definition
 */
export interface WorkflowStep {
  agentId: string;
  instruction?: string;
  waitForCompletion?: boolean;
}

export interface WorkflowDefinition {
  name: string;
  steps: WorkflowStep[];
}

/**
 * Types for vote options
 */
export interface VoteOption {
  id: string;
  label: string;
  description?: string;
}

export interface VoteResult {
  agentId: string;
  selectedOptionId: string;
  reasoning?: string;
}
