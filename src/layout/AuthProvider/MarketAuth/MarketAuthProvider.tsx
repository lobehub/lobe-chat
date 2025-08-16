'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

import { MarketOIDC } from './oidc';
import { MarketAuthContextType, MarketAuthSession, OIDCConfig } from './types';

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

  // 初始化 OIDC 客户端（仅在客户端）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const oidcConfig: OIDCConfig = {
        baseUrl: process.env.NEXT_PUBLIC_MARKET_BASE_URL || 'http://localhost:8787',
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
            setSession(parsedSession);
            setStatus('authenticated');
            return;
          } else {
            console.log('[MarketAuth] Stored session has expired');
            sessionStorage.removeItem('market_auth_session');
            removeTokenFromCookie();
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

      // 创建会话对象
      const newSession: MarketAuthSession = {
        accessToken: tokenResponse.access_token,
        expiresAt: Date.now() + tokenResponse.expires_in * 1000,
        expiresIn: tokenResponse.expires_in,
        scope: tokenResponse.scope,
        tokenType: tokenResponse.token_type as 'Bearer',
      };

      // 存储 token 到 cookie 和 sessionStorage
      setTokenToCookie(tokenResponse.access_token, tokenResponse.expires_in);
      sessionStorage.setItem('market_auth_session', JSON.stringify(newSession));

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
  };

  /**
   * 初始化时恢复会话
   */
  useEffect(() => {
    restoreSession();
  }, []);

  const contextValue: MarketAuthContextType = {
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
