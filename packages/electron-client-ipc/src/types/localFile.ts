// Define types for local file operations
export interface LocalFileItem {
  contentType?: string;
  createdTime: Date;
  isDirectory: boolean;
  lastAccessTime: Date;
  // Spotlight specific metadata
  metadata?: {
    [key: string]: any;
  };
  modifiedTime: Date;
  name: string;
  path: string;
  size: number;
  type: string;
}

export interface ListLocalFileParams {
  path: string;
}

export interface LocalReadFileParams {
  path: string;
}

export interface LocalReadFilesParams {
  paths: string[];
}

export interface LocalReadFileResult {
  charCount: number;
  content: string;
  createdTime: Date;
  fileType: string;
  filename: string;
  lineCount: number;
  modifiedTime: Date;
}

export interface LocalSearchFilesParams {
  directory?: string;
  keywords: string; // Optional directory to limit search
}

export interface OpenLocalFileParams {
  path: string;
}

export interface OpenLocalFolderParams {
  isDirectory?: boolean;
  path: string;
}
