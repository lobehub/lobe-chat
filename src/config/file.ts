import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

const DEFAULT_S3_FILE_PATH = 'files';

export const getFileConfig = () => {
  return createEnv({
    client: {
      NEXT_PUBLIC_S3_DOMAIN: z.string().url().optional(),
      NEXT_PUBLIC_S3_FILE_PATH: z.string().optional(),
    },
    runtimeEnv: {
      CHUNKS_AUTO_EMBEDDING: process.env.CHUNKS_AUTO_EMBEDDING !== '0',
      CHUNKS_AUTO_GEN_METADATA: process.env.CHUNKS_AUTO_GEN_METADATA !== '0',

      NEXT_PUBLIC_S3_DOMAIN: process.env.NEXT_PUBLIC_S3_DOMAIN,
      NEXT_PUBLIC_S3_FILE_PATH: process.env.NEXT_PUBLIC_S3_FILE_PATH || DEFAULT_S3_FILE_PATH,

      S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
      S3_BUCKET: process.env.S3_BUCKET,
      S3_ENDPOINT: process.env.S3_ENDPOINT,
      S3_REGION: process.env.S3_REGION,
      S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
      S3_SET_ACL: process.env.S3_SET_ACL !== '0',
    },
    server: {
      CHUNKS_AUTO_EMBEDDING: z.boolean(),
      CHUNKS_AUTO_GEN_METADATA: z.boolean(),

      // S3
      S3_ACCESS_KEY_ID: z.string().optional(),
      S3_BUCKET: z.string().optional(),
      S3_ENDPOINT: z.string().url().optional(),

      S3_REGION: z.string().optional(),
      S3_SECRET_ACCESS_KEY: z.string().optional(),
      S3_SET_ACL: z.boolean(),
    },
  });
};

export const fileEnv = getFileConfig();
