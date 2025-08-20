export interface PythonParams {
  code: string;
}

interface Output {
  type: 'stdout' | 'stderr';
  value: string;
}

export interface PythonExecutionResult {
  error?: string;
  output: Output[];
  result?: string;
  success: boolean;
}

export interface PythonState {
  error?: any;
  executionResult?: PythonExecutionResult;
  isExecuting?: boolean;
}
