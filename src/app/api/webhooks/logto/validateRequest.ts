import { headers } from 'next/headers';
import { createHmac } from 'node:crypto';

export type LogtToUserEntity = {
  applicationId?: string;
  avatar?: string;
  createdAt?: string;
  customData?: object;
  id: string;
  identities?: object;
  isSuspended?: boolean;
  lastSignInAt?: string;
  name?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  username?: string;
};

interface LogtoWebhookPayload {
  // Only support user event currently
  data: LogtToUserEntity;
  event: string;
}

export const validateRequest = async (request: Request, signingKey: string) => {
  const payloadString = await request.text();
  const headerPayload = headers();
  const logtoHeaderSignature = headerPayload.get('logto-signature-sha-256')!;
  try {
    const hmac = createHmac('sha256', signingKey);
    hmac.update(payloadString);
    const signature = hmac.digest('hex');
    if (signature === logtoHeaderSignature) {
      return JSON.parse(payloadString) as LogtoWebhookPayload;
    } else {
      console.warn('[logto]: signature verify failed, please check your logto signature in env');
      return;
    }
  } catch {
    console.error('[logto]: incoming webhook failed verification');
    return;
  }
};
