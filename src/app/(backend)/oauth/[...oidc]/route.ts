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
  // Use getters to access the final state
  readonly responseBody: string | Buffer;
  readonly responseHeaders: Record<string, string | string[]>;
  readonly responseStatus: number;
}

const createNodeResponse = (resolvePromise: () => void): ResponseCollector => {
  log('Creating NodeResponse adapter');
  // ---> Store state in an object to modify by reference <---
  const state = {
    responseBody: '' as string | Buffer,
    // Default status
    responseHeaders: {} as Record<string, string | string[]>,
    responseStatus: 200,
  };
  let promiseResolved = false;

  const nodeResponse: any = {
    end: (chunk?: string | Buffer) => {
      log('NodeResponse.end called');
      if (chunk) {
        log('NodeResponse.end chunk: %s', chunk.toString());
        state.responseBody += chunk; // Modify state object
      }

      const locationHeader = state.responseHeaders['location'];
      if (locationHeader && state.responseStatus === 200) {
        log(
          'NodeResponse.end detected Location header (%s) with status 200. Overriding status to 302.',
          locationHeader,
        );
        state.responseStatus = 302; // Modify state object
      }

      log('NodeResponse.end finished');

      if (!promiseResolved) {
        log('NodeResponse.end resolving the main promise.');
        promiseResolved = true;
        resolvePromise();
      } else {
        log('NodeResponse.end: Main promise already resolved, doing nothing.');
      }
    },
    getHeader: (name: string) => {
      const lowerName = name.toLowerCase();
      log(
        'NodeResponse.getHeader called for: %s, value: %s',
        lowerName,
        state.responseHeaders[lowerName],
      );
      return state.responseHeaders[lowerName]; // Read from state object
    },
    getHeaderNames: () => {
      const names = Object.keys(state.responseHeaders);
      log('NodeResponse.getHeaderNames called, returning: %O', names);
      return names;
    },
    getHeaders: () => {
      log('NodeResponse.getHeaders called, returning: %O', state.responseHeaders);
      return state.responseHeaders; // Read from state object
    },
    headersSent: false,
    setHeader: (name: string, value: string | string[]) => {
      const lowerName = name.toLowerCase();
      log('NodeResponse.setHeader called - name: %s, value: %s', lowerName, value);
      state.responseHeaders[lowerName] = value; // Modify state object
    },
    write: (chunk: string | Buffer) => {
      log('NodeResponse.write called');
      log('NodeResponse.write chunk: %s', chunk.toString());
      state.responseBody += chunk; // Modify state object
      log('NodeResponse.write finished');
    },
    writeHead: (status: number, headers?: Record<string, string | string[]>) => {
      log('NodeResponse.writeHead called - status: %d', status);
      state.responseStatus = status; // Modify state object
      if (headers) {
        log('NodeResponse.writeHead headers: %O', headers);
        const lowerCaseHeaders = Object.entries(headers).reduce(
          (acc, [key, value]) => {
            acc[key.toLowerCase()] = value;
            return acc;
          },
          {} as Record<string, string | string[]>,
        );
        state.responseHeaders = { ...state.responseHeaders, ...lowerCaseHeaders }; // Modify state object
      }
      (nodeResponse as any).headersSent = true;
      log('NodeResponse.writeHead finished, headersSent = true');
    },
  } as unknown as ServerResponse;

  log('NodeResponse adapter created successfully');
  // ---> Return collector with getters accessing the internal state object <---
  return {
    nodeResponse,
    get responseBody() {
      return state.responseBody;
    },
    get responseHeaders() {
      return state.responseHeaders;
    },
    get responseStatus() {
      return state.responseStatus;
    },
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

  // ---> Declare collector OUTSIDE the promise scope <---
  let responseCollector: ResponseCollector | null = null;

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

    log('Calling provider.callback() for GET');
    await new Promise<void>((resolve, reject) => {
      let middleware;
      try {
        log('Attempting to get middleware from provider.callback()');
        middleware = provider.callback();
        log('Successfully obtained middleware function.');
      } catch (syncError) {
        log('SYNC ERROR during provider.callback() call itself: %O', syncError);
        reject(syncError);
        return;
      }

      // ---> Assign collector OUTSIDE the promise scope <---
      responseCollector = createNodeResponse(resolve);
      const nodeResponse = responseCollector.nodeResponse;

      log('Calling the obtained middleware...');
      middleware(nodeRequest, nodeResponse, (error?: Error) => {
        log('Middleware callback function HAS BEEN EXECUTED.');
        if (error) {
          log('Middleware error reported via callback: %O', error);
          reject(error); // Reject if callback reports error
        } else {
          log(
            'Middleware completed successfully via callback (may be redundant if .end() was called).',
          );
          // Ensure promise resolves even if end() wasn't called but callback was
          resolve();
        }
      });
      log('Middleware call initiated, waiting for its callback OR nodeResponse.end()...');
    });

    log('Promise surrounding middleware call resolved.');

    if (!responseCollector) {
      throw new Error('ResponseCollector was not initialized.');
    }

    const {
      responseStatus: finalStatus,
      responseBody: finalBody,
      responseHeaders: finalHeaders,
    } = responseCollector as ResponseCollector;

    log('Final Response Status: %d', finalStatus);
    log('Final Response Headers: %O', finalHeaders);

    return new NextResponse(finalBody, {
      // eslint-disable-next-line no-undef
      headers: finalHeaders as HeadersInit,
      status: finalStatus,
    });
  } catch (error) {
    log('Error handling OIDC GET request: %O', error); // Log the full error object
    // Ensure responseCollector is checked even in catch block if needed, though error likely occurred before/during promise
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

  // ---> Declare collector OUTSIDE the promise scope <---
  let responseCollector: ResponseCollector | null = null;

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

    log('Calling provider.callback() for POST');
    await new Promise<void>((resolve, reject) => {
      let middleware;
      try {
        log('Attempting to get middleware from provider.callback()');
        middleware = provider.callback();
        log('Successfully obtained middleware function.');
      } catch (syncError) {
        log('SYNC ERROR during provider.callback() call itself: %O', syncError);
        reject(syncError);
        return;
      }

      // ---> Assign collector OUTSIDE the promise scope <---
      responseCollector = createNodeResponse(resolve);
      const nodeResponse = responseCollector.nodeResponse;

      log('Calling the obtained middleware...');
      middleware(nodeRequest, nodeResponse, (error?: Error) => {
        log('Middleware callback function HAS BEEN EXECUTED.');
        if (error) {
          log('Middleware error reported via callback: %O', error);
          reject(error);
        } else {
          log(
            'Middleware completed successfully via callback (may be redundant if .end() was called).',
          );
          resolve();
        }
      });
      log('Middleware call initiated, waiting for its callback OR nodeResponse.end()...');
    });

    log('Promise surrounding middleware call resolved.');

    // ---> Access final state from the collector OUTSIDE the promise <---
    if (!responseCollector) {
      throw new Error('ResponseCollector was not initialized.');
    }
    const finalStatus = responseCollector.responseStatus;
    const finalBody = responseCollector.responseBody;
    const finalHeaders = responseCollector.responseHeaders;

    log('Final Response Status: %d', finalStatus);
    log('Final Response Headers: %O', finalHeaders);

    return new NextResponse(finalBody, {
      headers: finalHeaders as HeadersInit,
      status: finalStatus,
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
