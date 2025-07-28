import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const oidcEnv = createEnv({
  client: {},
  runtimeEnv: {
    ENABLE_OIDC: process.env.ENABLE_OIDC === '1',
    OIDC_JWKS_KEY: process.env.OIDC_JWKS_KEY,
  },
  server: {
    // 是否启用 OIDC
    ENABLE_OIDC: z.boolean().optional().default(false),
    // OIDC 签名密钥
    // 必须是一个包含私钥的 JWKS (JSON Web Key Set) 格式的 JSON 字符串。
    // 可以使用 `node scripts/generate-oidc-jwk.mjs` 命令生成。
    OIDC_JWKS_KEY: z.string().optional(),
  },
});
