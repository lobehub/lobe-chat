import debug from 'debug';
import { NextRequest } from 'next/server';
import { IncomingMessage, ServerResponse } from 'node:http';

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
 * @param pathPrefix 路径前缀，如 '/oauth'
 * @param bodyText 可选的请求体文本，用于 POST 请求
 */
export const createNodeRequest = (
  req: NextRequest,
  pathPrefix: string = '/oauth',
  bodyText?: string,
): IncomingMessage => {
  // 构建 URL 对象
  const url = new URL(req.url);

  // 计算相对于前缀的路径
  const providerPath = url.pathname.startsWith(pathPrefix)
    ? url.pathname.slice(pathPrefix.length)
    : url.pathname;

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
 * 创建用于 OIDC Provider 交互细节的基本请求和响应对象
 * @param uid 交互 ID
 * @param host 主机名，默认从环境变量或使用 localhost:3000
 */
export const createInteractionRequestResponse = (uid: string, host?: string) => {
  const hostName = host || process.env.NEXTAUTH_URL || 'localhost:3000';

  // 创建请求对象
  const req = {
    cookies: {},
    headers: {
      host: hostName,
    },
    url: `/interaction/${uid}`,
  } as unknown as IncomingMessage;

  // 创建响应对象
  const res = {
    end: () => {},
    getHeader: () => {},
    getHeaderNames: () => [],
    getHeaders: () => ({}),
    headersSent: false,
    setHeader: () => {},
    write: () => {},
    writeHead: () => {},
  } as unknown as ServerResponse;

  return { req, res };
};

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
