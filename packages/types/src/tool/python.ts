export interface PythonParams {
  code: string;
}

interface Output {
  type: 'stdout' | 'stderr';
  value: string;
}

export interface PythonImageItem {
  // 临时预览 URL (base64)
  filename: string; 
  imageId?: string; 
  // 持久化后的文件 ID
  previewUrl?: string; // 图片文件名
}

export interface PythonExecutionResult {
  error?: string;
  images?: PythonImageItem[]; // 新增图片数组
  output: Output[];
  result?: string;
  success: boolean;
}

export interface PythonState {
  error?: any;
  executionResult?: PythonExecutionResult;
  isExecuting?: boolean;
}
