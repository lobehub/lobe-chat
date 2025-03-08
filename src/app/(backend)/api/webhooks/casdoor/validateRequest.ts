import { headers } from 'next/headers';

import { authEnv } from '@/config/auth';

export type CasdoorUserEntity = {
  avatar?: string;
  displayName: string;
  email?: string;
  id: string;
};

interface CasdoorWebhookPayload {
  action?: string;
  // The object is the user entity that is updated.
  // ref: https://github.com/casdoor/casdoor/issues/1918#issuecomment-1572218847
  object?: CasdoorUserEntity;
}

export const validateRequest = async (request: Request, secret?: string) => {
  const payloadString = await request.text();
  const headerPayload = await headers();
  const casdoorSecret = headerPayload.get('casdoor-secret')!;
  try {
    if (casdoorSecret === secret) {
      const parsed = JSON.parse(payloadString, (key, value) => {
        if (key === 'object' && typeof value === 'string') {
          return JSON.parse(value);
        }
        return value;
      }) as Partial<CasdoorWebhookPayload> & CasdoorUserEntity; 

      // If enabling webhook Extended user fields  
      if (!parsed.object) {
        const { avatar, displayName, email, id } = parsed;
        if (
          'avatar' in parsed &&
          'displayName' in parsed &&
          'email' in parsed &&
          'id' in parsed
        ) {
          parsed.object = { avatar, displayName, email, id };
        } else {
          console.warn('[Casdoor] Missing required fields: avatar, displayName, email, id must all exist. Please check the configuration of Extended user fields in webhook of casdoor.');
        }
      }
      return parsed as CasdoorWebhookPayload;
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
    console.error('[Casdoor]: incoming webhook failed in verification.\n', e, payloadString);
    return;
  }
};
