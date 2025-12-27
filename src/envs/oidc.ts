import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const oidcEnv = createEnv({
  client: {},
  runtimeEnv: {
    ENABLE_OIDC: process.env.ENABLE_OIDC === '1',
    OIDC_JWKS_KEY: process.env.OIDC_JWKS_KEY,
  },
  server: {
    // Whether to enable OIDC
    ENABLE_OIDC: z.boolean().optional().default(false),
    // OIDC signing key
    // Must be a JSON string in JWKS (JSON Web Key Set) format containing a private key.
    // Can be generated using the `node scripts/generate-oidc-jwk.mjs` command.
    OIDC_JWKS_KEY: z.string().optional(),
  },
});
