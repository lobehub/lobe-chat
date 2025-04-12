import debug from 'debug';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { IncomingMessage, ServerResponse } from 'node:http';
import urlJoin from 'url-join';

import { appEnv } from '@/config/app';

const log = debug('lobe-oidc:http-adapter');

/**
 * 将 Next.js 请求头转换为标准 Node.js HTTP 头格式
 */
export const convertHeadersToNodeHeaders = (nextHeaders: Headers): Record<string, string> => {
  const headers: Record<string, string> = {};
  nextHeaders.forEach((value, key) => {
    headers[key] = value;
  });
  return headers;
};

/**
 * 创建用于 OIDC Provider 的 Node.js HTTP 请求对象
 * @param req Next.js 请求对象
 * @param pathPrefix 路径前缀
 * @param bodyText 可选的请求体文本，用于 POST 请求
 */
export const createNodeRequest = (
  req: NextRequest,
  pathPrefix: string = '/oidc',
  bodyText?: string,
): IncomingMessage => {
  // 构建 URL 对象
  const url = new URL(req.url);

  // 计算相对于前缀的路径
  let providerPath = url.pathname;
  if (pathPrefix && url.pathname.startsWith(pathPrefix)) {
    providerPath = url.pathname.slice(pathPrefix.length);
  }

  // 确保路径始终以/开头
  if (!providerPath.startsWith('/')) {
    providerPath = '/' + providerPath;
  }

  log('Creating Node.js request from Next.js request');
  log('Original path: %s, Provider path: %s', url.pathname, providerPath);

  const nodeRequest = {
    // 基本属性
    headers: convertHeadersToNodeHeaders(req.headers),
    method: req.method,
    // 模拟可读流行为
    // eslint-disable-next-line @typescript-eslint/ban-types
    on: (event: string, handler: Function) => {
      if (event === 'data' && bodyText) {
        handler(bodyText);
      }
      if (event === 'end') {
        handler();
      }
    },

    url: providerPath + url.search,

    // POST 请求所需属性
    ...(bodyText && {
      body: bodyText,
      readable: true,
    }),

    // 添加 Node.js 服务器所期望的额外属性
    socket: {
      remoteAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
    },
  } as unknown as IncomingMessage;

  log('Node.js request created with method %s and path %s', nodeRequest.method, nodeRequest.url);
  return nodeRequest;
};

/**
 * 响应收集器接口，用于捕获 OIDC Provider 的响应
 */
export interface ResponseCollector {
  nodeResponse: ServerResponse;
  readonly responseBody: string | Buffer;
  readonly responseHeaders: Record<string, string | string[]>;
  readonly responseStatus: number;
}

/**
 * 创建用于 OIDC Provider 的 Node.js HTTP 响应对象
 * @param resolvePromise 当响应完成时调用的解析函数
 */
export const createNodeResponse = (resolvePromise: () => void): ResponseCollector => {
  log('Creating Node.js response collector');

  // 存储响应状态的对象
  const state = {
    responseBody: '' as string | Buffer,
    responseHeaders: {} as Record<string, string | string[]>,
    responseStatus: 200,
  };

  let promiseResolved = false;

  const nodeResponse: any = {
    end: (chunk?: string | Buffer) => {
      log('NodeResponse.end called');
      if (chunk) {
        log('NodeResponse.end chunk: %s', typeof chunk === 'string' ? chunk : '(Buffer)');
        // @ts-ignore
        state.responseBody += chunk;
      }

      const locationHeader = state.responseHeaders['location'];
      if (locationHeader && state.responseStatus === 200) {
        log('Location header detected with status 200, overriding to 302');
        state.responseStatus = 302;
      }

      if (!promiseResolved) {
        log('Resolving response promise');
        promiseResolved = true;
        resolvePromise();
      }
    },

    getHeader: (name: string) => {
      const lowerName = name.toLowerCase();
      return state.responseHeaders[lowerName];
    },

    getHeaderNames: () => {
      return Object.keys(state.responseHeaders);
    },

    getHeaders: () => {
      return state.responseHeaders;
    },

    headersSent: false,

    setHeader: (name: string, value: string | string[]) => {
      const lowerName = name.toLowerCase();
      log('Setting header: %s = %s', lowerName, value);
      state.responseHeaders[lowerName] = value;
    },

    write: (chunk: string | Buffer) => {
      log('NodeResponse.write called with chunk');
      // @ts-ignore
      state.responseBody += chunk;
    },

    writeHead: (status: number, headers?: Record<string, string | string[]>) => {
      log('NodeResponse.writeHead called with status: %d', status);
      state.responseStatus = status;

      if (headers) {
        const lowerCaseHeaders = Object.entries(headers).reduce(
          (acc, [key, value]) => {
            acc[key.toLowerCase()] = value;
            return acc;
          },
          {} as Record<string, string | string[]>,
        );
        state.responseHeaders = { ...state.responseHeaders, ...lowerCaseHeaders };
      }

      (nodeResponse as any).headersSent = true;
    },
  } as unknown as ServerResponse;

  log('Node.js response collector created successfully');

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
 * 创建用于调用 provider.interactionDetails 的上下文 (req, res)
 * @param uid 交互 ID
 */
export const createContextForInteractionDetails = async (
  uid: string,
): Promise<{ req: IncomingMessage; res: ServerResponse }> => {
  log('Creating context for interaction details for uid: %s', uid);

  // 使用APP_URL环境变量来构建URL基础部分
  const baseUrl = appEnv.APP_URL!;
  log('Using base URL: %s', baseUrl);

  // 从baseUrl提取主机名用于headers
  const hostName = new URL(baseUrl).host;

  // 1. 获取真实的 Cookies
  const cookieStore = await cookies();
  const realCookies: Record<string, string> = {};
  cookieStore.getAll().forEach((cookie) => {
    realCookies[cookie.name] = cookie.value;
  });
  log('Real cookies found: %o', Object.keys(realCookies));

  // 特别检查交互会话cookie
  const interactionCookieName = `_interaction_${uid}`;
  if (realCookies[interactionCookieName]) {
    log('Found interaction session cookie: %s', interactionCookieName);
  } else {
    log('Warning: Interaction session cookie not found: %s', interactionCookieName);
  }

  // 2. 构建包含真实 Cookie 的 Headers
  const headers = new Headers({ host: hostName });
  const cookieString = Object.entries(realCookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
  if (cookieString) {
    headers.set('cookie', cookieString);
    log('Setting cookie header');
  } else {
    log('No cookies found to set in header');
  }

  // 3. 创建模拟的 NextRequest
  // 注意：这里的 IP, geo, ua 等信息可能是 oidc-provider 某些特性需要的，
  // 如果遇到相关问题，可能需要从真实请求头中提取 (e.g., 'x-forwarded-for', 'user-agent')
  const interactionUrl = urlJoin(baseUrl, `/oauth/consent/${uid}`);
  log('Creating interaction URL: %s', interactionUrl);

  const mockNextRequest = {
    cookies: {
      // 模拟 NextRequestCookies 接口
      get: (name: string) => cookieStore.get(name)?.value,
      getAll: () => cookieStore.getAll(),
      has: (name: string) => cookieStore.has(name),
    },
    geo: {},
    headers: headers,
    ip: '127.0.0.1',
    method: 'GET',
    nextUrl: new URL(interactionUrl),
    page: { name: undefined, params: undefined },
    ua: undefined,
    url: new URL(interactionUrl),
  } as unknown as NextRequest;
  log('Mock NextRequest created for url: %s', mockNextRequest.url);

  // 4. 使用 createNodeRequest 创建模拟的 Node.js IncomingMessage
  // pathPrefix 设置为 '/' 因为我们的 URL 已经是 Provider 期望的路径格式 /interaction/:uid
  const req: IncomingMessage = createNodeRequest(mockNextRequest, '/');
  // @ts-ignore - 将解析出的 cookies 附加到模拟的 Node.js 请求上
  req.cookies = realCookies;
  log('Node.js IncomingMessage created, attached real cookies');

  // 5. 使用 createNodeResponse 创建模拟的 Node.js ServerResponse
  let resolveFunc: () => void;
  new Promise<void>((resolve) => {
    resolveFunc = resolve;
  });

  const responseCollector: ResponseCollector = createNodeResponse(() => resolveFunc());
  const res: ServerResponse = responseCollector.nodeResponse;
  log('Node.js ServerResponse created');

  return { req, res };
};
