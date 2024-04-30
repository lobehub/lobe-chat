import { getClientConfig } from '@/config/client';

const { ENABLE_SENTRY } = getClientConfig();

export type ErrorType = Error & { digest?: string };

export const sentryCaptureException = async (error: Error & { digest?: string }) => {
  if (!ENABLE_SENTRY) return;
  const { captureException } = await import('@sentry/nextjs');
  return captureException(error);
};
