import { ListObjectsCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { z } from 'zod';

import { fileEnv } from '@/config/file';

export const fileSchema = z.object({
  Key: z.string(),
  LastModified: z.date(),
  Size: z.number(),
});

export const listFileSchema = z.array(fileSchema);

export type FileType = z.infer<typeof fileSchema>;

export class S3 {
  private client: S3Client;

  private bucket: string;

  constructor() {
    if (!fileEnv.S3_ACCESS_KEY_ID || !fileEnv.S3_SECRET_ACCESS_KEY || !fileEnv.S3_BUCKET)
      throw new Error('S3 environment variables are not set completely, please check your env');

    this.bucket = fileEnv.S3_BUCKET;

    this.client = new S3Client({
      credentials: {
        accessKeyId: fileEnv.S3_ACCESS_KEY_ID,
        secretAccessKey: fileEnv.S3_SECRET_ACCESS_KEY,
      },
      endpoint: fileEnv.S3_ENDPOINT,
      region: fileEnv.S3_REGION,
    });
  }

  public async getImages(): Promise<FileType[]> {
    const command = new ListObjectsCommand({
      Bucket: this.bucket,
    });

    const res = await this.client.send(command);
    return listFileSchema.parse(res.Contents);
  }

  public async createPreSignedUrl(filename: string): Promise<string> {
    const command = new PutObjectCommand({
      ACL: 'public-read',
      Bucket: this.bucket,
      Key: `${fileEnv.S3_FILE_PATH}/${filename}`,
    });

    return getSignedUrl(this.client, command, { expiresIn: 3600 });
  }
}
