import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { z } from 'zod';

import { fileEnv } from '@/config/file';
import { YEAR } from '@/utils/units';
import { inferContentTypeFromImageUrl } from '@/utils/url';

export const fileSchema = z.object({
  Key: z.string(),
  LastModified: z.date(),
  Size: z.number(),
});

export const listFileSchema = z.array(fileSchema);

export type FileType = z.infer<typeof fileSchema>;

const DEFAULT_S3_REGION = 'us-east-1';

export class S3 {
  private readonly client: S3Client;

  private readonly bucket: string;

  private readonly setAcl: boolean;

  constructor() {
    if (!fileEnv.S3_ACCESS_KEY_ID || !fileEnv.S3_SECRET_ACCESS_KEY || !fileEnv.S3_BUCKET)
      throw new Error('S3 environment variables are not set completely, please check your env');

    this.bucket = fileEnv.S3_BUCKET;
    this.setAcl = fileEnv.S3_SET_ACL;

    this.client = new S3Client({
      credentials: {
        accessKeyId: fileEnv.S3_ACCESS_KEY_ID,
        secretAccessKey: fileEnv.S3_SECRET_ACCESS_KEY,
      },
      endpoint: fileEnv.S3_ENDPOINT,
      forcePathStyle: fileEnv.S3_ENABLE_PATH_STYLE,
      region: fileEnv.S3_REGION || DEFAULT_S3_REGION,
      // refs: https://github.com/lobehub/lobe-chat/pull/5479
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });
  }

  public async deleteFile(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return this.client.send(command);
  }

  public async deleteFiles(keys: string[]) {
    const command = new DeleteObjectsCommand({
      Bucket: this.bucket,
      Delete: { Objects: keys.map((key) => ({ Key: key })) },
    });

    return this.client.send(command);
  }

  public async getFileContent(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.client.send(command);

    if (!response.Body) {
      throw new Error(`No body in response with ${key}`);
    }

    return response.Body.transformToString();
  }

  public async getFileByteArray(key: string): Promise<Uint8Array> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.client.send(command);

    if (!response.Body) {
      throw new Error(`No body in response with ${key}`);
    }

    return response.Body.transformToByteArray();
  }

  public async createPreSignedUrl(key: string): Promise<string> {
    const command = new PutObjectCommand({
      ACL: this.setAcl ? 'public-read' : undefined,
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, { expiresIn: 3600 });
  }

  public async createPreSignedUrlForPreview(key: string, expiresIn?: number): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: expiresIn ?? fileEnv.S3_PREVIEW_URL_EXPIRE_IN,
    });
  }

  /**
   * 生成公共访问URL（适用于设置了public-read ACL的文件）
   * @param key S3对象键
   * @returns 公共访问URL
   */
  public getPublicUrl(key: string): string {
    // 如果配置了公共域名，使用公共域名
    if (fileEnv.S3_PUBLIC_DOMAIN) {
      return `${fileEnv.S3_PUBLIC_DOMAIN}/${key}`;
    }

    // 否则构建标准的S3公共URL
    if (fileEnv.S3_ENDPOINT) {
      // 自定义端点（如MinIO等）
      if (fileEnv.S3_ENABLE_PATH_STYLE) {
        return `${fileEnv.S3_ENDPOINT}/${this.bucket}/${key}`;
      } else {
        return `${fileEnv.S3_ENDPOINT.replace('://', `://${this.bucket}.`)}/${key}`;
      }
    }

    // AWS S3标准URL
    const region = fileEnv.S3_REGION || DEFAULT_S3_REGION;
    return `https://${this.bucket}.s3.${region}.amazonaws.com/${key}`;
  }

  // 添加一个新方法用于上传二进制内容
  public async uploadBuffer(path: string, buffer: Buffer, contentType?: string) {
    const command = new PutObjectCommand({
      ACL: this.setAcl ? 'public-read' : undefined,
      Body: buffer,
      Bucket: this.bucket,
      ContentType: contentType,
      Key: path,
    });

    return this.client.send(command);
  }

  public async uploadContent(path: string, content: string) {
    const command = new PutObjectCommand({
      ACL: this.setAcl ? 'public-read' : undefined,
      Body: content,
      Bucket: this.bucket,
      Key: path,
    });

    return this.client.send(command);
  }

  public async uploadMedia(key: string, buffer: Buffer) {
    const command = new PutObjectCommand({
      ACL: this.setAcl ? 'public-read' : undefined,
      Body: buffer,
      Bucket: this.bucket,
      CacheControl: `public, max-age=${YEAR}`,
      ContentType: inferContentTypeFromImageUrl(key)!,
      Key: key,
    });

    await this.client.send(command);
  }
}
