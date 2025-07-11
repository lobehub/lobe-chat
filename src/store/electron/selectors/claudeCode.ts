import { ElectronStore } from '../store';

export const claudeCodeSelectors = {
  apiKeySource: (s: ElectronStore) => s.claudeCode.apiKeySource,
  error: (s: ElectronStore) => s.claudeCode.error,
  isAvailable: (s: ElectronStore) => s.claudeCode.isAvailable,
  isLoading: (s: ElectronStore) => s.claudeCode.isLoading,
  recentSessions: (s: ElectronStore) => s.claudeCode.recentSessions,
  version: (s: ElectronStore) => s.claudeCode.version,
}; 