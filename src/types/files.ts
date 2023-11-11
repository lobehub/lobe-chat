export interface FilePreview {
  base64Url?: string;
  data?: ArrayBuffer;
  fileType: string;
  name: string;
  type?: string | 'local';
  url: string;
}
