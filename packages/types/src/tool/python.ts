export interface PythonParams {
  code: string;
  packages: string[];
}

interface Output {
  type: 'stdout' | 'stderr';
  value: string;
}

export interface PythonFileItem {
  data?: Blob;
  fileId?: string;
  filename: string;
  previewUrl?: string;
}

export interface PythonExecutionResult {
  error?: string;
  files?: PythonFileItem[];
  output?: Output[];
  result?: string;
  success: boolean;
}

export interface PythonState {
  error?: any;
  executionResult?: PythonExecutionResult;
  isExecuting?: boolean;
}
