export const enableClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
export const enableNextAuth = process.env.NEXT_PUBLIC_ENABLE_NEXT_AUTH === '1';
export const enableAuth = enableClerk || enableNextAuth || false;

export const LOBE_CHAT_AUTH_HEADER = 'X-lobe-chat-auth';
export const LOBE_CHAT_OIDC_AUTH_HEADER = 'Oidc-Auth';

export const OAUTH_AUTHORIZED = 'X-oauth-authorized';

export const SECRET_XOR_KEY = 'LobeHub · LobeHub';
