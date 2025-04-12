import debug from 'debug';
import { NextRequest, NextResponse } from 'next/server';
import { IncomingMessage, ServerResponse } from 'node:http';
import { URL } from 'node:url';

import { oidcEnv } from '@/envs/oidc';

import { getOIDCProvider } from '../oidcProvider';

const log = debug('lobe-oidc:route'); // Create a debug instance with a namespace

/**
 * 处理请求头部兼容性
 * NextRequest 和 oidc-provider 间的适配
 */
const convertHeadersToNodeHeaders = (nextHeaders: Headers): Record<string, string> => {
  const headers: Record<string, string> = {};
  nextHeaders.forEach((value, key) => {
    headers[key] = value;
  });
  return headers;
};

/**
 * 创建伪造的 Node.js HTTP 响应对象
 * 用于捕获 oidc-provider 处理的响应内容
 */
interface ResponseCollector {
  nodeResponse: ServerResponse;
  responseBody: string | Buffer;
  responseHeaders: Record<string, string | string[]>;
  responseStatus: number;
}

const createNodeResponse = (): ResponseCollector => {
  // 创建响应收集器
  let responseBody: string | Buffer = '';
  let responseStatus = 200;
  let responseHeaders: Record<string, string | string[]> = {};

  // 创建一个伪造的 Node.js HTTP 响应对象
  const nodeResponse: any = {
    end: (chunk?: string | Buffer) => {
      if (chunk) {
        // @ts-ignore
        responseBody += chunk;
      }
    },
    getHeader: (name: string) => responseHeaders[name.toLowerCase()],
    // 添加其他必需的方法
    getHeaderNames: () => Object.keys(responseHeaders),

    getHeaders: () => responseHeaders,

    headersSent: false,

    setHeader: (name: string, value: string | string[]) => {
      responseHeaders[name.toLowerCase()] = value;
    },

    write: (chunk: string | Buffer) => {
      // @ts-ignore
      responseBody += chunk;
    },
    writeHead: (status: number, headers?: Record<string, string | string[]>) => {
      responseStatus = status;
      if (headers) {
        responseHeaders = { ...responseHeaders, ...headers };
      }
    },
  } as unknown as ServerResponse;

  return {
    nodeResponse,
    responseBody,
    responseHeaders,
    responseStatus,
  };
};

/**
 * 处理 catch-all 路由下的所有 OIDC 请求
 * 这个处理器会捕获所有 /oauth/[...oidc] 的请求
 * 例如: /oauth/auth, /oauth/token, /oauth/userinfo 等
 */
export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  log('Received GET request: %s %s', req.method, req.url);
  log('Path: %s, Pathname: %s', requestUrl.pathname, requestUrl.pathname);
  log('Headers: %O', Object.fromEntries(req.headers.entries())); // Log headers object
  try {
    if (!oidcEnv.ENABLE_OIDC) {
      log('OIDC is not enabled');
      return new NextResponse('OIDC is not enabled', { status: 404 });
    }

    // 获取 OIDC Provider 实例
    const provider = await getOIDCProvider();

    // 构建 URL 对象
    const url = new URL(req.url);

    // --> 新增：计算相对于 /oauth 的路径
    const providerPath = url.pathname.startsWith('/oauth')
      ? url.pathname.slice('/oauth'.length)
      : url.pathname;

    // 创建一个伪造的 Node.js HTTP 请求对象
    const nodeRequest = {
      headers: convertHeadersToNodeHeaders(req.headers),
      method: req.method,
      // 添加 Node.js 服务器所期望的方法
      on: () => {},

      // 添加更多的请求属性
      socket: {
        remoteAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      },

      url: providerPath + url.search, // <-- 修改这里，使用相对路径
    } as unknown as IncomingMessage;

    // 创建响应对象
    const { nodeResponse, responseBody, responseStatus, responseHeaders } = createNodeResponse();

    log('Calling provider.callback() for GET');
    await new Promise<void>((resolve, reject) => {
      const middleware = provider.callback();

      // 调用中间件并在完成时解决 Promise
      middleware(nodeRequest, nodeResponse, (error?: Error) => {
        if (error) {
          log('Middleware error during GET: %O', error); // Log middleware error
          reject(error);
        } else {
          resolve();
        }
      });
    });

    log('provider.callback() finished for GET. Status: %d', responseStatus); // Log status

    // 构建 NextResponse
    const nextResponse = new NextResponse(responseBody, {
      // eslint-disable-next-line no-undef
      headers: responseHeaders as HeadersInit,
      status: responseStatus,
    });

    return nextResponse;
  } catch (error) {
    log('Error handling OIDC GET request: %O', error); // Log the full error object
    return new NextResponse(`Internal Server Error: ${(error as Error).message}`, { status: 500 });
  }
}

/**
 * 处理 POST 请求 (用于令牌端点等)
 */
export async function POST(req: NextRequest) {
  log('Received POST request: %s %s', req.method, req.url);
  const bodyText = await req.text(); // Read body first
  log('Body: %s', bodyText); // Log body as string

  // Clone request for reuse as body is consumed
  const clonedReq = req.clone();

  try {
    if (!oidcEnv.ENABLE_OIDC) {
      log('OIDC is not enabled');
      return new NextResponse('OIDC is not enabled', { status: 404 });
    }

    // 获取 OIDC Provider 实例
    const provider = await getOIDCProvider();

    // 构建 URL 对象
    const url = new URL(clonedReq.url);

    // --> 新增：计算相对于 /oauth 的路径
    const providerPath = url.pathname.startsWith('/oauth')
      ? url.pathname.slice('/oauth'.length)
      : url.pathname;

    // 创建一个伪造的 Node.js HTTP 请求对象，包含 POST 请求体
    const nodeRequest = {
      body: bodyText, // Use the read body text
      headers: convertHeadersToNodeHeaders(clonedReq.headers),
      method: clonedReq.method,
      // 模拟可读流
      // eslint-disable-next-line @typescript-eslint/ban-types
      on: (event: string, handler: Function) => {
        if (event === 'data' && bodyText) {
          handler(bodyText);
        }
        if (event === 'end') {
          handler();
        }
      },
      // 为 POST 请求添加特定属性
      readable: true,
      socket: {
        remoteAddress: clonedReq.headers.get('x-forwarded-for') || '127.0.0.1',
      },
      url: providerPath + url.search, // <-- 修改这里，使用相对路径
    } as unknown as IncomingMessage;

    // 创建响应对象
    const { nodeResponse, responseBody, responseStatus, responseHeaders } = createNodeResponse();

    log('Calling provider.callback() for POST');
    // 使用 Promise 来包装 provider.callback() 的调用
    await new Promise<void>((resolve, reject) => {
      const middleware = provider.callback();

      // 调用中间件并在完成时解决 Promise
      middleware(nodeRequest, nodeResponse, (error?: Error) => {
        if (error) {
          log('Middleware error during POST: %O', error); // Log middleware error
          reject(error);
        } else {
          resolve();
        }
      });
    });

    log('provider.callback() finished for POST. Status: %d', responseStatus); // Log status

    // 构建 NextResponse
    return new NextResponse(responseBody, {
      // eslint-disable-next-line no-undef
      headers: responseHeaders as HeadersInit,
      status: responseStatus,
    });
  } catch (error) {
    log('Error handling OIDC POST request: %O', error); // Log the full error object
    return new NextResponse(`Internal Server Error: ${(error as Error).message}`, { status: 500 });
  }
}

/**
 * 同样处理其他 HTTP 方法
 */
export const PUT = POST;
export const DELETE = POST;
export const PATCH = POST;
