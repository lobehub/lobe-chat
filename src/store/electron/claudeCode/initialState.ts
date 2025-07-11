import { ClaudeCodeSessionInfo } from '@lobechat/electron-client-ipc';

// Claude Code 相关状态
export interface ClaudeCodeState {
  apiKeySource: string;
  error: string | null;
  isAvailable: boolean;
  isLoading: boolean;
  recentSessions: ClaudeCodeSessionInfo[];
  version: string;
}

export interface ClaudeCodeStoreState {
  claudeCode: ClaudeCodeState;
}

export const initialClaudeCodeState: ClaudeCodeStoreState = {
  claudeCode: {
    apiKeySource: '',
    error: null,
    isAvailable: false,
    isLoading: false,
    recentSessions: [],
    version: '',
  },
};
