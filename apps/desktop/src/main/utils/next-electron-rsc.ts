// copy from https://github.com/kirill-konshin/next-electron-rsc
import { serialize as serializeCookie } from 'cookie';
import type { Protocol, Session } from 'electron';
import type { NextConfig } from 'next';
import type NextNodeServer from 'next/dist/server/next-server';
import assert from 'node:assert';
import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';
import path from 'node:path';
import { parse } from 'node:url';
import resolve from 'resolve';
import { parse as parseCookie, splitCookiesString } from 'set-cookie-parser';

import { isDev } from '@/const/env';
import { createLogger } from '@/utils/logger';

// 创建日志记录器
const logger = createLogger('utils:next-electron-rsc');

// 定义自定义处理器类型
export type CustomRequestHandler = (request: Request) => Promise<Response | null | undefined>;

export const createRequest = async ({
  socket,
  request,
  session,
}: {
  request: Request;
  session: Session;
  socket: Socket;
}): Promise<IncomingMessage> => {
  const req = new IncomingMessage(socket);

  const url = new URL(request.url);

  // Normal Next.js URL does not contain schema and host/port, otherwise endless loops due to butchering of schema by normalizeRepeatedSlashes in resolve-routes
  req.url = url.pathname + (url.search || '');
  req.method = request.method;

  request.headers.forEach((value, key) => {
    req.headers[key] = value;
  });

  try {
    // @see https://github.com/electron/electron/issues/39525#issue-1852825052
    const cookies = await session.cookies.get({
      url: request.url,
      // domain: url.hostname,
      // path: url.pathname,
      // `secure: true` Cookies should not be sent via http
      // secure: url.protocol === 'http:' ? false : undefined,
      // theoretically not possible to implement sameSite because we don't know the url
      // of the website that is requesting the resource
    });

    if (cookies.length) {
      const cookiesHeader = [];

      for (const cookie of cookies) {
        const { name, value } = cookie;
        cookiesHeader.push(serializeCookie(name, value)); // ...(options as any)?
      }

      req.headers.cookie = cookiesHeader.join('; ');
    }
  } catch (e) {
    throw new Error('Failed to parse cookies', { cause: e });
  }

  if (request.body) {
    req.push(Buffer.from(await request.arrayBuffer()));
  }

  req.push(null);
  req.complete = true;

  return req;
};

export class ReadableServerResponse extends ServerResponse {
  private responsePromise: Promise<Response>;

  constructor(req: IncomingMessage) {
    super(req);

    this.responsePromise = new Promise<Response>((resolve) => {
      const readableStream = new ReadableStream({
        cancel: () => {},
        pull: () => {
          this.emit('drain');
        },
        start: (controller) => {
          let onData;

          this.on(
            'data',
            (onData = (chunk) => {
              controller.enqueue(chunk);
            }),
          );

          this.once('end', (chunk) => {
            controller.enqueue(chunk);
            controller.close();
            this.off('data', onData);
          });
        },
      });

      this.once('writeHead', (statusCode) => {
        resolve(
          new Response(readableStream, {
            headers: this.getHeaders() as any,
            status: statusCode,
            statusText: this.statusMessage,
          }),
        );
      });
    });
  }

  write(chunk: any, ...args): boolean {
    this.emit('data', chunk);
    return super.write(chunk, ...args);
  }

  end(chunk: any, ...args): this {
    this.emit('end', chunk);
    return super.end(chunk, ...args);
  }

  writeHead(statusCode: number, ...args: any): this {
    this.emit('writeHead', statusCode);
    return super.writeHead(statusCode, ...args);
  }

  getResponse() {
    return this.responsePromise;
  }
}

/**
 * https://nextjs.org/docs/pages/building-your-application/configuring/custom-server
 * https://github.com/vercel/next.js/pull/68167/files#diff-d0d8b7158bcb066cdbbeb548a29909fe8dc4e98f682a6d88654b1684e523edac
 * https://github.com/vercel/next.js/blob/canary/examples/custom-server/server.ts
 *
 * @param {string} standaloneDir
 * @param {string} localhostUrl
 * @param {import('electron').Protocol} protocol
 * @param {boolean} debug
 */
export function createHandler({
  standaloneDir,
  localhostUrl,
  protocol,
  debug = false,
}: {
  debug?: boolean;
  localhostUrl: string;
  protocol: Protocol;
  standaloneDir: string;
}) {
  assert(standaloneDir, 'standaloneDir is required');
  assert(protocol, 'protocol is required');

  // 存储自定义请求处理器的数组
  const customHandlers: CustomRequestHandler[] = [];

  // 注册自定义请求处理器的方法 - 在开发和生产环境中都提供此功能
  function registerCustomHandler(handler: CustomRequestHandler) {
    logger.debug('Registering custom request handler');
    customHandlers.push(handler);
    return () => {
      const index = customHandlers.indexOf(handler);
      if (index !== -1) {
        logger.debug('Unregistering custom request handler');
        customHandlers.splice(index, 1);
      }
    };
  }
  let registerProtocolHandle = false;

  protocol.registerSchemesAsPrivileged([
    {
      privileges: {
        secure: true,
        standard: true,
        supportFetchAPI: true,
      },
      scheme: 'http',
    },
  ]);
  logger.debug('Registered HTTP scheme as privileged');

  // 初始化 Next.js 应用（仅在生产环境中使用）
  let app: NextNodeServer | null = null;
  let handler: any = null;
  let preparePromise: Promise<void> | null = null;

  if (!isDev) {
    logger.info('Initializing Next.js app for production');
    const next = require(resolve.sync('next', { basedir: standaloneDir }));

    // @see https://github.com/vercel/next.js/issues/64031#issuecomment-2078708340
    const config = require(path.join(standaloneDir, '.next', 'required-server-files.json'))
      .config as NextConfig;
    process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(config);

    app = next({
      dev: false,
      dir: standaloneDir,
    }) as NextNodeServer;

    handler = app.getRequestHandler();
    preparePromise = app.prepare();
  } else {
    logger.debug('Starting in development mode');
  }

  // 通用的请求处理函数 - 开发和生产环境共用
  const handleRequest = async (
    request: Request,
    session: Session,
    socket: Socket,
  ): Promise<Response> => {
    try {
      // 先尝试使用自定义处理器处理请求
      for (const customHandler of customHandlers) {
        try {
          const response = await customHandler(request);
          if (response) {
            if (debug) logger.debug(`Custom handler processed: ${request.url}`);
            return response;
          }
        } catch (error) {
          if (debug) logger.error(`Custom handler error: ${error}`);
          // 继续尝试下一个处理器
        }
      }

      // 创建 Node.js 请求对象
      const req = await createRequest({ request, session, socket });
      // 创建可读取响应的 Response 对象
      const res = new ReadableServerResponse(req);

      if (isDev) {
        // 开发环境：转发请求到开发服务器
        if (debug) logger.debug(`Forwarding request to dev server: ${request.url}`);

        // 修改 URL 以指向开发服务器
        const devUrl = new URL(req.url, localhostUrl);

        // 使用 node:http 模块发送请求到开发服务器
        const http = require('node:http');
        const devReq = http.request(
          {
            headers: req.headers,
            hostname: devUrl.hostname,
            method: req.method,
            path: devUrl.pathname + (devUrl.search || ''),
            port: devUrl.port,
          },
          (devRes) => {
            // 设置响应状态码和头部
            res.statusCode = devRes.statusCode;
            res.statusMessage = devRes.statusMessage;

            // 复制响应头
            Object.keys(devRes.headers).forEach((key) => {
              res.setHeader(key, devRes.headers[key]);
            });

            // 流式传输响应内容
            devRes.pipe(res);
          },
        );

        // 处理错误
        devReq.on('error', (err) => {
          if (debug) logger.error(`Error forwarding request: ${err}`);
        });

        // 传输请求体
        req.pipe(devReq);
      } else {
        // 生产环境：使用 Next.js 处理请求
        if (debug) logger.debug(`Processing with Next.js handler: ${request.url}`);

        // 确保 Next.js 已准备就绪
        if (preparePromise) await preparePromise;

        const url = parse(req.url, true);
        handler(req, res, url);
      }

      // 获取 Response 对象
      const response = await res.getResponse();

      // 处理 cookies（两种环境通用处理）
      try {
        const cookies = parseCookie(
          response.headers.getSetCookie().reduce((r, c) => {
            return [...r, ...splitCookiesString(c)];
          }, []),
        );

        for (const cookie of cookies) {
          const expires = cookie.expires
            ? cookie.expires.getTime()
            : cookie.maxAge
              ? Date.now() + cookie.maxAge * 1000
              : undefined;

          if (expires && expires < Date.now()) {
            await session.cookies.remove(request.url, cookie.name);
            continue;
          }

          await session.cookies.set({
            domain: cookie.domain,
            expirationDate: expires,
            httpOnly: cookie.httpOnly,
            name: cookie.name,
            path: cookie.path,
            secure: cookie.secure,
            url: request.url,
            value: cookie.value,
          } as any);
        }
      } catch (e) {
        logger.error('Failed to set cookies', e);
      }

      if (debug) logger.debug(`Request processed: ${request.url}, status: ${response.status}`);
      return response;
    } catch (e) {
      if (debug) logger.error(`Error handling request: ${e}`);
      return new Response(e.message, { status: 500 });
    }
  };

  // 创建拦截器函数
  const createInterceptor = ({ session }: { session: Session }) => {
    assert(session, 'Session is required');
    logger.debug(
      `Creating interceptor with session in ${isDev ? 'development' : 'production'} mode`,
    );

    const socket = new Socket();

    const closeSocket = () => socket.end();

    process.on('SIGTERM', () => closeSocket);
    process.on('SIGINT', () => closeSocket);

    if (!isDev && !registerProtocolHandle) {
      logger.debug(
        `Registering HTTP protocol handler in ${isDev ? 'development' : 'production'} mode`,
      );
      protocol.handle('http', async (request) => {
        if (!isDev) {
          assert(request.url.startsWith(localhostUrl), 'External HTTP not supported, use HTTPS');
        }

        return handleRequest(request, session, socket);
      });
      registerProtocolHandle = true;
    }

    return function stopIntercept() {
      if (registerProtocolHandle) {
        logger.debug('Unregistering HTTP protocol handler');
        protocol.unhandle('http');
        registerProtocolHandle = false;
      }
      process.off('SIGTERM', () => closeSocket);
      process.off('SIGINT', () => closeSocket);
      closeSocket();
    };
  };

  return { createInterceptor, registerCustomHandler };
}
