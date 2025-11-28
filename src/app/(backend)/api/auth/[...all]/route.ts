import { enableBetterAuth, enableNextAuth } from '@lobechat/const';
import { toNextJsHandler } from 'better-auth/next-js';

import { auth } from '@/auth';
import NextAuthNode from '@/libs/next-auth';

const betterAuthHandler = toNextJsHandler(auth);

export const GET = enableBetterAuth
  ? betterAuthHandler.GET
  : enableNextAuth
    ? NextAuthNode.handlers.GET
    : undefined;

export const POST = enableBetterAuth
  ? betterAuthHandler.POST
  : enableNextAuth
    ? NextAuthNode.handlers.POST
    : undefined;
