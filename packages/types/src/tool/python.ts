export interface PythonParams {
  code: string;
  packages: string[];
}

interface Output {
  type: 'stdout' | 'stderr';
  value: string;
}

export interface PythonFileItem {
  data?: Uint8Array;
  fileId?: string;
  filename: string;
  previewUrl?: string; // 临时预览 URL，用于上传前展示
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
