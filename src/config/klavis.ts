import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/**
 * Klavis Service Configuration
 *
 * Architecture:
 * - Server-side: KLAVIS_API_KEY is stored and used only on the server
 * - Client-side: NEXT_PUBLIC_KLAVIS_ENABLE flag indicates if Klavis is enabled
 * - Client calls server APIs (to be implemented in Phase 3) which use the API key
 *
 * Security:
 * - API key is NEVER exposed to the client
 * - Client only knows if the feature is enabled or not
 */
export const getKlavisConfig = () => {
  return createEnv({
    client: {
      NEXT_PUBLIC_KLAVIS_ENABLE: z
        .string()
        .optional()
        .transform((val) => val === '1' || val === 'true'),
    },
    runtimeEnv: {
      // Server-side API key (never exposed to client)
      KLAVIS_API_KEY: process.env.KLAVIS_API_KEY,
      // Client-side enable flag
      NEXT_PUBLIC_KLAVIS_ENABLE: process.env.NEXT_PUBLIC_KLAVIS_ENABLE,
    },
    server: {
      KLAVIS_API_KEY: z.string().optional(),
    },
  });
};

export const klavisEnv = getKlavisConfig();

/**
 * Check if Klavis is enabled
 * This is safe to call from client-side
 */
export const isKlavisEnabled = (): boolean => {
  if (typeof window !== 'undefined') {
    // Client-side: check the enable flag
    return klavisEnv.NEXT_PUBLIC_KLAVIS_ENABLE === true;
  }
  // Server-side: check if API key exists
  return !!klavisEnv.KLAVIS_API_KEY;
};

/**
 * Get Klavis API Key (server-side only)
 * IMPORTANT: This should only be called from server-side code
 */
export const getServerKlavisApiKey = (): string | undefined => {
  if (typeof window !== 'undefined') {
    console.error('[Klavis] Attempted to access API key from client-side!');
    return undefined;
  }
  return klavisEnv.KLAVIS_API_KEY;
};
