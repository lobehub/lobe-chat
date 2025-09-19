'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

import { MarketOIDC } from './oidc';
import { MarketAuthContextType, MarketAuthSession, MarketUserInfo, OIDCConfig } from './types';

const MarketAuthContext = createContext<MarketAuthContextType | null>(null);

interface MarketAuthProviderProps {
  children: ReactNode;
}

/**
 * 从 cookie 中获取 token
 */
const getTokenFromCookie = (): string | null => {
  if (typeof document === 'undefined') return null;

  // eslint-disable-next-line unicorn/no-document-cookie
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'market-bearertoken') {
      console.log('[MarketAuth] Found market token in cookie');
      return value;
    }
  }
  return null;
};

/**
 * 将 token 存储到 cookie
 */
const setTokenToCookie = (token: string, expiresIn: number) => {
  console.log('[MarketAuth] Storing token to cookie');
  const expiresAt = new Date(Date.now() + expiresIn * 1000);
  // eslint-disable-next-line unicorn/no-document-cookie
  document.cookie = `market-bearertoken=${token}; expires=${expiresAt.toUTCString()}; path=/; secure; samesite=strict`;
};

/**
 * 从 cookie 中删除 token
 */
const removeTokenFromCookie = () => {
  console.log('[MarketAuth] Removing token from cookie');
  // eslint-disable-next-line unicorn/no-document-cookie
  document.cookie = 'market-bearertoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

/**
 * 获取用户信息
 */
const fetchUserInfo = async (accessToken: string): Promise<MarketUserInfo | null> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_MARKET_BASE_URL || 'http://127.0.0.1:8787';
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const userInfoUrl = `${cleanBaseUrl}/market-oidc/userinfo`;

    console.log('[MarketAuth] Fetching user info from:', userInfoUrl);

    const response = await fetch(userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });

    if (!response.ok) {
      console.error(
        '[MarketAuth] Failed to fetch user info:',
        response.status,
        response.statusText,
      );
      return null;
    }

    const userInfo = (await response.json()) as MarketUserInfo;
    console.log('[MarketAuth] User info fetched successfully:', userInfo);

    return userInfo;
  } catch (error) {
    console.error('[MarketAuth] Error fetching user info:', error);
    return null;
  }
};

/**
 * 刷新令牌（暂时简化，后续可以实现 refresh token 逻辑）
 */
const refreshToken = async (): Promise<boolean> => {
  console.log('[MarketAuth] Refresh token not implemented yet');
  return false;
};

/**
 * Market 授权上下文提供者
 */
export const MarketAuthProvider = ({ children }: MarketAuthProviderProps) => {
  const [session, setSession] = useState<MarketAuthSession | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [oidcClient, setOidcClient] = useState<MarketOIDC | null>(null);
  const [shouldReauthorize, setShouldReauthorize] = useState(false);

  // 初始化 OIDC 客户端（仅在客户端）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log(
        'process.env.NEXT_PUBLIC_MARKET_BASE_URL',
        process.env.NEXT_PUBLIC_MARKET_BASE_URL,
      );
      const oidcConfig: OIDCConfig = {
        baseUrl: process.env.NEXT_PUBLIC_MARKET_BASE_URL || 'http://127.0.0.1:8787',
        clientId: 'lobehub-desktop-web',
        redirectUri: `${window.location.origin}/market-auth-callback`,
        scope: 'openid profile email',
      };
      setOidcClient(new MarketOIDC(oidcConfig));
    }
  }, []);

  /**
   * 检查并恢复会话
   */
  const restoreSession = () => {
    console.log('[MarketAuth] Attempting to restore session');
    const token = getTokenFromCookie();

    if (token) {
      // 从 sessionStorage 中获取完整的会话信息
      const sessionData = sessionStorage.getItem('market_auth_session');
      if (sessionData) {
        try {
          const parsedSession = JSON.parse(sessionData) as MarketAuthSession;

          // 检查 token 是否过期
          if (parsedSession.expiresAt > Date.now()) {
            console.log('[MarketAuth] Session restored from storage');

            // 如果 session 中没有 userInfo，尝试从单独的存储中获取
            if (!parsedSession.userInfo) {
              const userInfoData = sessionStorage.getItem('market_user_info');
              if (userInfoData) {
                try {
                  parsedSession.userInfo = JSON.parse(userInfoData);
                } catch (error) {
                  console.error('[MarketAuth] Failed to parse stored user info:', error);
                }
              }
            }

            setSession(parsedSession);
            setStatus('authenticated');
            return;
          } else {
            console.log('[MarketAuth] Stored session has expired, will trigger re-authorization');
            sessionStorage.removeItem('market_auth_session');
            removeTokenFromCookie();
            // 标记需要重新授权，等待 oidcClient 准备好
            setShouldReauthorize(true);
            return;
          }
        } catch (error) {
          console.error('[MarketAuth] Failed to parse stored session:', error);
          sessionStorage.removeItem('market_auth_session');
          removeTokenFromCookie();
        }
      }
    }

    console.log('[MarketAuth] No valid session found');
    setStatus('unauthenticated');
  };

  /**
   * 登录方法
   */
  const signIn = async (): Promise<void> => {
    console.log('[MarketAuth] Starting sign in process');

    if (!oidcClient) {
      console.error('[MarketAuth] OIDC client not initialized');
      throw new Error('OIDC client not initialized');
    }

    try {
      setStatus('loading');

      // 启动 OIDC 授权流程并获取授权码
      const authResult = await oidcClient.startAuthorization();
      console.log('[MarketAuth] Authorization successful, exchanging code for token');

      // 用授权码换取访问令牌
      const tokenResponse = await oidcClient.exchangeCodeForToken(
        authResult.code,
        authResult.state,
      );

      // 获取用户信息
      const userInfo = await fetchUserInfo(tokenResponse.access_token);

      // 创建会话对象
      const newSession: MarketAuthSession = {
        accessToken: tokenResponse.access_token,
        expiresAt: Date.now() + tokenResponse.expires_in * 1000,
        expiresIn: tokenResponse.expires_in,
        scope: tokenResponse.scope,
        tokenType: tokenResponse.token_type as 'Bearer',
        userInfo: userInfo || undefined,
      };

      // 存储 token 到 cookie 和 sessionStorage
      setTokenToCookie(tokenResponse.access_token, tokenResponse.expires_in);
      sessionStorage.setItem('market_auth_session', JSON.stringify(newSession));

      // 单独存储用户信息到 sessionStorage 供其他地方使用
      if (userInfo) {
        sessionStorage.setItem('market_user_info', JSON.stringify(userInfo));
      }

      setSession(newSession);
      setStatus('authenticated');

      console.log('[MarketAuth] Sign in completed successfully');
    } catch (error) {
      console.error('[MarketAuth] Sign in failed:', error);
      setStatus('unauthenticated');
      throw error;
    }
  };

  /**
   * 登出方法
   */
  const signOut = () => {
    console.log('[MarketAuth] Signing out');
    setSession(null);
    setStatus('unauthenticated');
    removeTokenFromCookie();
    sessionStorage.removeItem('market_auth_session');
    sessionStorage.removeItem('market_user_info');
  };

  /**
   * 获取当前用户信息
   */
  const getCurrentUserInfo = (): MarketUserInfo | null => {
    if (session?.userInfo) {
      return session.userInfo;
    }

    // 如果 session 中没有，尝试从 sessionStorage 中获取
    try {
      const userInfoData = sessionStorage.getItem('market_user_info');
      if (userInfoData) {
        return JSON.parse(userInfoData) as MarketUserInfo;
      }
    } catch (error) {
      console.error('[MarketAuth] Failed to get user info from storage:', error);
    }

    return null;
  };

  /**
   * 初始化时恢复会话
   */
  useEffect(() => {
    restoreSession();
  }, []);

  /**
   * 当需要重新授权且 OIDC 客户端准备好时，自动触发重新授权
   */
  useEffect(() => {
    const handleAutoReauthorization = async () => {
      if (shouldReauthorize && oidcClient) {
        console.log('[MarketAuth] Auto-triggering re-authorization due to token expiry');
        setShouldReauthorize(false); // 重置标识，避免重复触发

        try {
          setStatus('loading');

          // 启动 OIDC 授权流程并获取授权码
          const authResult = await oidcClient.startAuthorization();
          console.log('[MarketAuth] Auto re-authorization successful, exchanging code for token');

          // 用授权码换取访问令牌
          const tokenResponse = await oidcClient.exchangeCodeForToken(
            authResult.code,
            authResult.state,
          );

          // 获取用户信息
          const userInfo = await fetchUserInfo(tokenResponse.access_token);

          // 创建会话对象
          const newSession: MarketAuthSession = {
            accessToken: tokenResponse.access_token,
            expiresAt: Date.now() + tokenResponse.expires_in * 1000,
            expiresIn: tokenResponse.expires_in,
            scope: tokenResponse.scope,
            tokenType: tokenResponse.token_type as 'Bearer',
            userInfo: userInfo || undefined,
          };

          // 存储 token 到 cookie 和 sessionStorage
          setTokenToCookie(tokenResponse.access_token, tokenResponse.expires_in);
          sessionStorage.setItem('market_auth_session', JSON.stringify(newSession));

          // 单独存储用户信息到 sessionStorage 供其他地方使用
          if (userInfo) {
            sessionStorage.setItem('market_user_info', JSON.stringify(userInfo));
          }

          setSession(newSession);
          setStatus('authenticated');

          console.log('[MarketAuth] Auto re-authorization completed successfully');
        } catch (error) {
          console.error('[MarketAuth] Auto re-authorization failed:', error);
          setStatus('unauthenticated');
        }
      }
    };

    handleAutoReauthorization();
  }, [shouldReauthorize, oidcClient]);

  const contextValue: MarketAuthContextType = {
    getCurrentUserInfo,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    refreshToken,
    session,
    signIn,
    signOut,
    status,
  };

  return <MarketAuthContext.Provider value={contextValue}>{children}</MarketAuthContext.Provider>;
};

/**
 * 使用 Market 授权的 Hook
 */
export const useMarketAuth = (): MarketAuthContextType => {
  const context = useContext(MarketAuthContext);
  if (!context) {
    throw new Error('useMarketAuth must be used within a MarketAuthProvider');
  }
  return context;
};
