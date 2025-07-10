export interface ClaudeCodeMessage {
  type: 'assistant' | 'user' | 'system' | 'result';
  message?: any;
  session_id?: string;
  subtype?: string;
  duration_ms?: number;
  duration_api_ms?: number;
  is_error?: boolean;
  num_turns?: number;
  result?: string;
  total_cost_usd?: number;
  apiKeySource?: string;
  cwd?: string;
  tools?: string[];
  mcp_servers?: Array<{ name: string; status: string }>;
  model?: string;
  permissionMode?: 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan';
}

export interface ClaudeCodeOptions {
  maxTurns?: number;
  systemPrompt?: string;
  appendSystemPrompt?: string;
  cwd?: string;
  allowedTools?: string[] | string;
  disallowedTools?: string[] | string;
  permissionMode?: 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan';
  outputFormat?: 'text' | 'json' | 'stream-json';
  inputFormat?: 'text' | 'stream-json';
  mcpConfig?: string;
  permissionPromptTool?: string;
  verbose?: boolean;
  continueLastSession?: boolean;
  resumeSessionId?: string;
}

export interface ClaudeCodeQueryParams {
  prompt: string;
  options?: ClaudeCodeOptions;
  abortSignal?: string; // Signal ID for abort functionality
}

export interface ClaudeCodeQueryResult {
  messages: ClaudeCodeMessage[];
  sessionId: string;
  success: boolean;
  error?: string;
}

export interface ClaudeCodeStreamingParams extends ClaudeCodeQueryParams {
  streamId: string; // Unique ID for this streaming session
}

export interface ClaudeCodeSessionInfo {
  sessionId: string;
  createdAt: number;
  lastActiveAt: number;
  turnCount: number;
  totalCost?: number;
} 