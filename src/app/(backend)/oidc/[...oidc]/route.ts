import debug from 'debug';
import { NextRequest, NextResponse } from 'next/server';
import { URL } from 'node:url';

import { oidcEnv } from '@/envs/oidc';
import { createNodeRequest, createNodeResponse } from '@/libs/oidc-provider/http-adapter';
import { getOIDCProvider } from '@/server/services/oidc/oidcProvider';

const log = debug('lobe-oidc:route'); // Create a debug instance with a namespace

const handler = async (req: NextRequest) => {
  const requestUrl = new URL(req.url);
  log(`Received ${req.method.toUpperCase()} request: %s %s`, req.method, req.url);
  log('Path: %s, Pathname: %s', requestUrl.pathname, requestUrl.pathname);

  // 声明响应收集器
  let responseCollector;

  try {
    if (!oidcEnv.ENABLE_OIDC) {
      log('OIDC is not enabled');
      return new NextResponse('OIDC is not enabled', { status: 404 });
    }

    // 获取 OIDC Provider 实例
    const provider = await getOIDCProvider();

    log(`Calling provider.callback() for ${req.method}`); // Log the method
    await new Promise<void>((resolve, reject) => {
      // <-- Make promise callback async
      let middleware: any;
      try {
        log('Attempting to get middleware from provider.callback()');
        middleware = provider.callback();
        log('Successfully obtained middleware function.');
      } catch (syncError) {
        log('SYNC ERROR during provider.callback() call itself: %O', syncError);
        reject(syncError);
        return;
      }

      // 使用辅助方法创建响应收集器
      responseCollector = createNodeResponse(resolve);
      const nodeResponse = responseCollector.nodeResponse;

      // 使用辅助方法创建 Node.js 请求对象，现在需要 await
      createNodeRequest(req).then((nodeRequest) => {
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
    });

    log('Promise surrounding middleware call resolved.');

    // 访问最终的响应状态
    if (!responseCollector) {
      throw new Error('ResponseCollector was not initialized.');
    }

    const {
      responseStatus: finalStatus,
      responseBody: finalBody,
      responseHeaders: finalHeaders,
    } = responseCollector;

    log('Final Response Status: %d', finalStatus);
    log('Final Response Headers: %O', finalHeaders);

    // 修复 Cloudflare Tunnel 等代理环境下的 Location 头部 URL 问题
    // @ts-ignore
    const processedHeaders = finalHeaders ? { ...finalHeaders } : {};
    if (processedHeaders['location'] && finalStatus >= 300 && finalStatus < 400) {
      try {
        const locationUrl = new URL(processedHeaders['location'] as string);
        const requestHost = req.headers.get('host');

        // 如果 Location 头部指向本地地址，但请求来自外部域名，则修正 URL
        if (
          (locationUrl.hostname === 'localhost' ||
            locationUrl.hostname === '127.0.0.1' ||
            locationUrl.hostname === '0.0.0.0') &&
          requestHost &&
          !requestHost.includes('localhost') &&
          !requestHost.includes('127.0.0.1') &&
          !requestHost.includes('0.0.0.0')
        ) {
          const forwardedProto =
            req.headers.get('x-forwarded-proto') ||
            req.headers.get('x-forwarded-protocol') ||
            (requestHost.includes('localhost') ? 'http' : 'https');

          const correctedUrl = `${forwardedProto}://${requestHost}${locationUrl.pathname}${locationUrl.search}${locationUrl.hash}`;
          processedHeaders['location'] = correctedUrl;
          log('Corrected Location header from %s to %s', finalHeaders['location'], correctedUrl);
        }
      } catch {
        log('Warning: Could not parse Location header URL: %s', processedHeaders['location']);
      }
    }

    return new NextResponse(finalBody, {
      // eslint-disable-next-line no-undef
      headers: processedHeaders as HeadersInit,
      status: finalStatus,
    });
  } catch (error) {
    log(`Error handling OIDC ${req.method} request: %O`, error); // Log method in error
    return new NextResponse(`Internal Server Error: ${(error as Error).message}`, { status: 500 });
  }
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
