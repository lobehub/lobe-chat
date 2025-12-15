/**
 * Types for Cloud Code Interpreter tool states
 * These types represent the state returned by each tool after execution
 */

// ==================== File Operations ====================

export interface ListLocalFilesState {
  files: Array<{
    isDirectory: boolean;
    name: string;
    path: string;
    size?: number;
  }>;
}

export interface ReadLocalFileState {
  content: string;
  endLine?: number;
  path: string;
  startLine?: number;
  totalLines?: number;
}

export interface WriteLocalFileState {
  bytesWritten?: number;
  path: string;
  success: boolean;
}

export interface EditLocalFileState {
  diffText?: string;
  linesAdded?: number;
  linesDeleted?: number;
  path: string;
  replacements: number;
}

export interface SearchLocalFilesState {
  results: Array<{
    isDirectory: boolean;
    modifiedAt?: string;
    name: string;
    path: string;
    size?: number;
  }>;
  totalCount: number;
}

export interface MoveLocalFilesState {
  results: Array<{
    destination: string;
    error?: string;
    source: string;
    success: boolean;
  }>;
  successCount: number;
  totalCount: number;
}

export interface RenameLocalFileState {
  error?: string;
  newPath: string;
  oldPath: string;
  success: boolean;
}

export interface GlobFilesState {
  files: string[];
  pattern: string;
  totalCount: number;
}

export interface GrepContentState {
  matches: Array<{
    content?: string;
    lineNumber?: number;
    path: string;
  }>;
  pattern: string;
  totalMatches: number;
}

// ==================== Shell Commands ====================

export interface RunCommandState {
  commandId?: string;
  error?: string;
  exitCode?: number;
  isBackground: boolean;
  output?: string;
  stderr?: string;
  success: boolean;
}

export interface GetCommandOutputState {
  error?: string;
  newOutput?: string;
  running: boolean;
  success: boolean;
}

export interface KillCommandState {
  commandId: string;
  error?: string;
  success: boolean;
}

// ==================== Session Info ====================

export interface SessionInfo {
  sessionExpiredAndRecreated: boolean;
  sessionId: string;
}
