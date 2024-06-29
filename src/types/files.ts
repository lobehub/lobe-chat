import { z } from 'zod';

export interface FilePreview {
  base64Url?: string;
  data?: ArrayBuffer;
  fileType: string;
  id: string;
  name: string;
  saveMode: 'local' | 'url';
  url: string;
}

export const UploadFileSchema = z.object({
  data: z.instanceof(ArrayBuffer).optional(),
  /**
   * file type
   * @example 'image/png'
   */
  fileType: z.string(),
  metadata: z.any().optional(),
  /**
   * file name
   * @example 'test.png'
   */
  name: z.string(),
  /**
   * the mode database save the file
   * local mean save the raw file into data
   * url mean upload the file to a cdn and then save the url
   */
  saveMode: z.enum(['local', 'url']),
  /**
   * file size
   */
  size: z.number(),
  /**
   * file url if saveMode is url
   */
  url: z.string().optional(),
});

export type UploadFileParams = z.infer<typeof UploadFileSchema>;
