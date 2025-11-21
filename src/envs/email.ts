/* eslint-disable sort-keys-fix/sort-keys-fix */
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      SMTP_HOST?: string;
      SMTP_PASS?: string;
      SMTP_PORT?: string;
      SMTP_SECURE?: string;
      SMTP_USER?: string;
    }
  }
}

export const getEmailConfig = () => {
  return createEnv({
    server: {
      SMTP_HOST: z.string().optional(),
      SMTP_PORT: z.coerce.number().optional(),
      SMTP_SECURE: z.boolean().optional(),
      SMTP_USER: z.string().optional(),
      SMTP_PASS: z.string().optional(),
    },
    runtimeEnv: {
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
      SMTP_SECURE: process.env.SMTP_SECURE === 'true',
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS,
    },
  });
};

export const emailEnv = getEmailConfig();
