import { type DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `auth`, contains information about the active session.
   */
  interface Session {
    error?: 'RefreshTokenError';
    user: {
      firstName?: string;
    } & DefaultSession['user'];
  }
  interface User {
    providerAccountId?: string;
  }
  /**
   * More types can be extends here
   * ref: https://authjs.dev/getting-started/typescript
   */
}

declare module '@auth/core/jwt' {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    access_token?: string;
    error?: 'RefreshTokenError';
    expires?: number;
    iss?: string;
    provider?: string;
    refresh_token?: string;
    userId: string;
  }
}
