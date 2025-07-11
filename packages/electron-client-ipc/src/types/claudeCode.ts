export interface ClaudeCodeMessage {
  apiKeySource?: string;
  cwd?: string;
  duration_api_ms?: number;
  duration_ms?: number;
  is_error?: boolean;
  mcp_servers?: Array<{ name: string; status: string }>;
  message?: any;
  model?: string;
  num_turns?: number;
  permissionMode?: 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan';
  result?: string;
  session_id?: string;
  subtype?: string;
  tools?: string[];
  total_cost_usd?: number;
  type: 'assistant' | 'user' | 'system' | 'result';
}

export interface ClaudeCodeOptions {
  allowedTools?: string[] | string;
  appendSystemPrompt?: string;
  continueLastSession?: boolean;
  cwd?: string;
  disallowedTools?: string[] | string;
  inputFormat?: 'text' | 'stream-json';
  maxTurns?: number;
  mcpConfig?: string;
  outputFormat?: 'text' | 'json' | 'stream-json';
  permissionMode?: 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan';
  permissionPromptTool?: string;
  resumeSessionId?: string;
  systemPrompt?: string;
  verbose?: boolean;
}

export interface ClaudeCodeQueryParams {
  abortSignal?: string;
  options?: ClaudeCodeOptions;
  prompt: string; // Signal ID for abort functionality
}

export interface ClaudeCodeQueryResult {
  error?: string;
  messages: ClaudeCodeMessage[];
  sessionId: string;
  success: boolean;
}

export interface ClaudeCodeStreamingParams extends ClaudeCodeQueryParams {
  streamId: string; // Unique ID for this streaming session
}

export interface ClaudeCodeSessionInfo {
  createdAt: number;
  lastActiveAt: number;
  sessionId: string;
  totalCost?: number;
  turnCount: number;
}
