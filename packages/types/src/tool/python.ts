import { PythonResult } from '@lobechat/python-interpreter';

export interface PythonInterpreterParams {
  code: string;
  packages: string[];
}

export interface PythonFileItem {
  data?: File;
  fileId?: string;
  filename: string;
  previewUrl?: string;
}

export interface PythonResponse extends PythonResult {
  files?: PythonFileItem[];
}

export interface PythonInterpreterState {
  error?: any;
}
