import { createTRPCClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import urlJoin from 'url-join';

import { serverDBEnv } from '@/config/db';
import { JWTPayload, LOBE_CHAT_AUTH_HEADER } from '@/const/auth';
import { isDesktop } from '@/const/version';
import { appEnv } from '@/envs/app';
import { createAsyncCallerFactory } from '@/libs/trpc/async';
import { createAsyncContextInner } from '@/libs/trpc/async/context';
import { KeyVaultsGateKeeper } from '@/server/modules/KeyVaultsEncrypt';

import { asyncRouter } from './index';
import type { AsyncRouter } from './index';

export const createAsyncServerClient = async (userId: string, payload: JWTPayload) => {
  const gateKeeper = await KeyVaultsGateKeeper.initWithEnvKey();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${serverDBEnv.KEY_VAULTS_SECRET}`,
    [LOBE_CHAT_AUTH_HEADER]: await gateKeeper.encrypt(JSON.stringify({ payload, userId })),
  };

  if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET) {
    headers['x-vercel-protection-bypass'] = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  }

  return createTRPCClient<AsyncRouter>({
    links: [
      httpBatchLink({
        headers,
        transformer: superjson,
        url: urlJoin(appEnv.APP_URL!, '/trpc/async'),
      }),
    ],
  });
};

/**
 * 用来推断 caller 类型辅助方法，但不实际调用 createAsyncCallerFactory，调用会报错：asyncRouter 没有初始化
 */
const helperFunc = () => {
  const dummyCreateCaller = createAsyncCallerFactory(asyncRouter);
  return {} as unknown as ReturnType<typeof dummyCreateCaller>;
};

export type UnifiedAsyncCaller = ReturnType<typeof helperFunc>;

interface CreateCallerOptions {
  jwtPayload: any;
  userId: string;
}

/**
 * 创建 caller 的工厂方法，兼容 desktop server 和 remote server 环境
 * 使用方式统一成 caller.a.b() 的调用方式
 */
export const createAsyncCaller = async (
  options: CreateCallerOptions,
): Promise<UnifiedAsyncCaller> => {
  const { userId, jwtPayload } = options;

  if (isDesktop) {
    // Desktop 环境：使用 caller 直接同线程调用方法
    const asyncContext = await createAsyncContextInner({
      jwtPayload,
      // 参考 src/libs/trpc/async/asyncAuth.ts
      secret: serverDBEnv.KEY_VAULTS_SECRET,
      userId,
    });

    const createCaller = createAsyncCallerFactory(asyncRouter);
    const caller = createCaller(asyncContext);

    return caller;
  }
  // 非 Desktop 环境：使用 HTTP Client
  // http client 调用方式是 client.a.b.mutate(), 我希望统一成 caller.a.b() 的调用方式
  else {
    const httpClient = await createAsyncServerClient(userId, jwtPayload);
    const createRecursiveProxy = (client: any, path: string[]): any => {
      // The target is a dummy function, so that 'apply' can be triggered.
      return new Proxy(() => {}, {
        apply: (target, thisArg, args) => {
          // 'apply' is triggered by the function call `(...)`.
          // The `path` at this point is the full path to the procedure.

          // Traverse the original httpClient to get the actual procedure object.
          const procedure = path.reduce((obj, key) => (obj ? obj[key] : undefined), client);

          if (procedure && typeof procedure.mutate === 'function') {
            // If we found a valid procedure, call its mutate method.
            return procedure.mutate(...args);
          } else {
            // This should not happen if the call path is correct.
            const message = `Procedure not found or not valid at path: ${path.join('.')}`;
            throw new Error(message);
          }
        },
        get: (_, property: string) => {
          // When a property is accessed, we just extend the path and return a new proxy.
          // This handles `caller.file.parseFileToChunks`
          if (property === 'then') return undefined; // Prevent async/await issues
          return createRecursiveProxy(client, [...path, property as string]);
        },
      });
    };

    return createRecursiveProxy(httpClient, []);
  }
};
