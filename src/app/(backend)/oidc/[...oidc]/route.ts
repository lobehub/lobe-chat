import debug from 'debug';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { URL } from 'node:url';

import { getDBInstance } from '@/database/core/web-server';
import { oidcEnv } from '@/envs/oidc';
import { DrizzleAdapter } from '@/libs/oidc-provider/adapter';
import { createNodeRequest, createNodeResponse } from '@/libs/oidc-provider/http-adapter';
import { getOIDCProvider } from '@/server/services/oidc/oidcProvider';

const log = debug('lobe-oidc:route'); // Create a debug instance with a namespace

// 会话同步标头
const OIDC_SESSION_HEADER = 'x-oidc-session-sync';

/**
 * 处理会话同步
 * 如果请求中包含 x-oidc-session-sync 头，预先创建一个 OIDC 会话
 */
const syncOIDCSession = async (req: NextRequest): Promise<void> => {
  const externalUserId = req.headers.get(OIDC_SESSION_HEADER);

  if (!externalUserId) {
    log('没有找到 x-oidc-session-sync 头，跳过会话同步');
    return;
  }

  log('找到会话同步请求，外部用户 ID: %s', externalUserId);

  try {
    const db = getDBInstance();
    const sessionAdapter = new DrizzleAdapter('Session', db);

    // 查找是否已有对应的 OIDC 会话
    // 使用新方法按用户 ID 查找会话
    const existingSession = await sessionAdapter.findSessionByUserId(externalUserId);

    if (existingSession) {
      log(
        '已找到与用户 %s 关联的现有 OIDC 会话，ID: %s',
        externalUserId,
        existingSession.uid || existingSession.jti,
      );
      return;
    }

    // 创建新的会话
    const sessionId = randomUUID();
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 30 * 24 * 60 * 60; // 30 天，与 provider.ts 中的 TTL 配置一致

    // 创建基本会话数据
    const sessionData = {
      accountId: externalUserId,

      // 添加额外会话信息
      authTime: now,

      // 添加所有必要的 OIDC 会话字段
      cookie: `oidc.session.${sessionId}`,

      exp: now + expiresIn,

      iat: now,

      jti: sessionId,

      // 为 findAccount 添加必要的字段
      login: {
        accountId: externalUserId,
        remember: true,
      },

      uid: sessionId,
      username: externalUserId,
    };

    // 使用适配器创建会话
    await sessionAdapter.upsert(sessionId, sessionData, expiresIn);
    log('成功为外部用户 %s 创建 OIDC 会话 %s', externalUserId, sessionId);
  } catch (error) {
    log('同步 OIDC 会话时出错: %O', error);
    console.error('同步 OIDC 会话错误:', error);
    // 不抛出错误，让请求继续处理
  }
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

  // 声明响应收集器
  let responseCollector;

  try {
    if (!oidcEnv.ENABLE_OIDC) {
      log('OIDC is not enabled');
      return new NextResponse('OIDC is not enabled', { status: 404 });
    }

    // 在获取 OIDC 提供者实例前同步会话
    await syncOIDCSession(req);

    // 获取 OIDC Provider 实例
    const provider = await getOIDCProvider();

    log('Calling provider.callback() for GET');
    await new Promise<void>((resolve, reject) => {
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

      // 使用辅助方法创建 Node.js 请求对象
      const nodeRequest = createNodeRequest(req);

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
    } = responseCollector;

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

  // 声明响应收集器
  let responseCollector;

  try {
    if (!oidcEnv.ENABLE_OIDC) {
      log('OIDC is not enabled');
      return new NextResponse('OIDC is not enabled', { status: 404 });
    }

    // 在获取 OIDC 提供者实例前同步会话
    await syncOIDCSession(req);

    // 获取 OIDC Provider 实例
    const provider = await getOIDCProvider();

    log('Calling provider.callback() for POST');
    await new Promise<void>((resolve, reject) => {
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

      // 使用辅助方法创建 Node.js 请求对象，包含 POST 请求体
      const nodeRequest = createNodeRequest(req, '/oauth', bodyText);

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

    return new NextResponse(finalBody, {
      // eslint-disable-next-line no-undef
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
