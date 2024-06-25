import NextAuth from 'next-auth';

import authConfig from './auth.config';

export const { auth, handlers } = NextAuth(authConfig);
