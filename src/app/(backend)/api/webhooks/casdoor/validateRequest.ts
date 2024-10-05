import { headers } from 'next/headers';

import { authEnv } from '@/config/auth';

export type CasdoorUserEntity = {
  avatar?: string;
  displayName: string;
  email?: string;
  id: string;
};

interface CasdoorWebhookPayload {
  action: string;
  // Only support user event currently
  extendedUser: CasdoorUserEntity;
}

export const validateRequest = async (request: Request, secret?: string) => {
  const payloadString = await request.text();
  const headerPayload = headers();
  const casdoorSecret = headerPayload.get('casdoor-secret')!;
  try {
    if (casdoorSecret === secret) {
      return JSON.parse(payloadString) as CasdoorWebhookPayload;
    } else {
      console.warn(
        '[Casdoor]: secret verify failed, please check your secret in `CASDOOR_WEBHOOK_SECRET`',
      );
      return;
    }
  } catch (e) {
    if (!authEnv.CASDOOR_WEBHOOK_SECRET) {
      throw new Error('`CASDOOR_WEBHOOK_SECRET` environment variable is missing.');
    }
    console.error('[Casdoor]: incoming webhook failed in verification.\n', e);
    return;
  }
};
