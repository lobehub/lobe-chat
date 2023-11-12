export interface FilePreview {
  base64Url?: string;
  data?: ArrayBuffer;
  fileType: string;
  name: string;
  saveMode?: string | 'local';
  url: string;
}
