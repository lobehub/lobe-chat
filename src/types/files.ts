export interface FilePreview {
  base64Url?: string;
  data?: ArrayBuffer;
  fileType: string;
  name: string;
  saveMode: 'local' | 'url';
  url: string;
}
