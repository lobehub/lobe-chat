'use client';

import { App } from 'antd';
import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MARKET_ENDPOINTS, MARKET_OIDC_ENDPOINTS } from '@/services/_url';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/slices/settings/selectors/settings';

import MarketAuthConfirmModal from './MarketAuthConfirmModal';
import ProfileSetupModal from './ProfileSetupModal';
import { MarketAuthError } from './errors';
import { MarketOIDC } from './oidc';
import {
  MarketAuthContextType,
  MarketAuthSession,
  MarketUserInfo,
  MarketUserProfile,
  OIDCConfig,
} from './types';
import { useMarketUserProfile } from './useMarketUserProfile';

const MarketAuthContext = createContext<MarketAuthContextType | null>(null);

interface MarketAuthProviderProps {
  children: ReactNode;
  isDesktop: boolean;
}

/**
 * 获取用户信息（从 OIDC userinfo endpoint）
 */
const fetchUserInfo = async (accessToken: string): Promise<MarketUserInfo | null> => {
  try {
    const response = await fetch(MARKET_OIDC_ENDPOINTS.userinfo, {
      body: JSON.stringify({ token: accessToken }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
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

    return userInfo;
  } catch (error) {
    console.error('[MarketAuth] Error fetching user info:', error);
    return null;
  }
};

/**
 * 从 DB 获取 market tokens
 */
const getMarketTokensFromDB = () => {
  const settings = settingsSelectors.currentSettings(useUserStore.getState());
  return settings.market;
};

/**
 * 存储 market tokens 到 DB
 */
const saveMarketTokensToDB = async (
  accessToken: string,
  refreshToken?: string,
  expiresAt?: number,
) => {
  try {
    await useUserStore.getState().setSettings({
      market: {
        accessToken,
        expiresAt,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('[MarketAuth] Failed to save tokens to DB:', error);
  }
};

/**
 * 清除 DB 中的 market tokens
 */
const clearMarketTokensFromDB = async () => {
  // 如果已经没有 tokens，不需要调用 setSettings
  const currentTokens = getMarketTokensFromDB();
  if (!currentTokens?.accessToken && !currentTokens?.refreshToken && !currentTokens?.expiresAt) {
    return;
  }

  try {
    await useUserStore.getState().setSettings({
      market: undefined,
    });
  } catch (error) {
    console.error('[MarketAuth] Failed to clear tokens from DB:', error);
  }
};

/**
 * 获取 refresh token（优先从 DB 获取）
 */
const getRefreshToken = (): string | null => {
  // 优先从 DB 获取
  const dbTokens = getMarketTokensFromDB();
  if (dbTokens?.refreshToken) {
    return dbTokens.refreshToken;
  }

  return null;
};

/**
 * 刷新令牌（暂时简化，后续可以实现 refresh token 逻辑）
 */
const refreshToken = async (): Promise<boolean> => {
  return false;
};

/**
 * 检查用户是否需要设置用户名（首次登录）
 */
const checkNeedsProfileSetup = async (username: string): Promise<boolean> => {
  try {
    const response = await fetch(MARKET_ENDPOINTS.getUserProfile(username));
    if (!response.ok) {
      // User profile not found, needs setup
      return true;
    }
    const profile = (await response.json()) as MarketUserProfile;
    // If userName is not set, user needs to complete profile setup
    return !profile.userName;
  } catch {
    // Error fetching profile, assume needs setup
    return true;
  }
};

/**
 * Market 授权上下文提供者
 */
export const MarketAuthProvider = ({ children, isDesktop }: MarketAuthProviderProps) => {
  const { message } = App.useApp();
  const { t } = useTranslation('marketAuth');

  const [session, setSession] = useState<MarketAuthSession | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [oidcClient, setOidcClient] = useState<MarketOIDC | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showProfileSetupModal, setShowProfileSetupModal] = useState(false);
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);
  const [pendingSignInResolve, setPendingSignInResolve] = useState<
    ((_value: number | null) => void) | null
  >(null);
  const [pendingSignInReject, setPendingSignInReject] = useState<((_reason?: any) => void) | null>(
    null,
  );

  // 订阅 user store 的初始化状态，当 isUserStateInit 为 true 时，settings 数据已加载完成
  const isUserStateInit = useUserStore((s) => s.isUserStateInit);

  // 初始化 OIDC 客户端（仅在客户端）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const baseUrl = process.env.NEXT_PUBLIC_MARKET_BASE_URL || 'https://market.lobehub.com';
      const desktopRedirectUri = new URL(MARKET_OIDC_ENDPOINTS.desktopCallback, baseUrl).toString();

      // 桌面端使用 Market 手动维护的 Web 回调，Web 端使用当前域名
      const redirectUri = isDesktop
        ? desktopRedirectUri
        : `${window.location.origin}/market-auth-callback`;

      const oidcConfig: OIDCConfig = {
        baseUrl,
        clientId: isDesktop ? 'lobehub-desktop' : 'lobechat-com',
        redirectUri,
        scope: 'openid profile email',
      };
      setOidcClient(new MarketOIDC(oidcConfig));
    }
  }, [isDesktop]);

  /**
   * 初始化：检查并恢复会话，获取用户信息
   */
  const initializeSession = async () => {
    setStatus('loading');

    const dbTokens = getMarketTokensFromDB();

    // 检查 DB 中是否有 token
    if (!dbTokens?.accessToken) {
      setStatus('unauthenticated');
      return;
    }

    // 检查 token 是否过期
    if (!dbTokens.expiresAt || dbTokens.expiresAt <= Date.now()) {
      // 清理过期的 DB tokens
      await clearMarketTokensFromDB();
      setStatus('unauthenticated');
      return;
    }

    // 获取用户信息
    const userInfo = await fetchUserInfo(dbTokens.accessToken);

    if (!userInfo) {
      // 清理无效的 token
      await clearMarketTokensFromDB();
      setStatus('unauthenticated');
      return;
    }

    const restoredSession: MarketAuthSession = {
      accessToken: dbTokens.accessToken,
      expiresAt: dbTokens.expiresAt,
      expiresIn: Math.floor((dbTokens.expiresAt - Date.now()) / 1000),
      scope: 'openid profile email',
      tokenType: 'Bearer',
      userInfo,
    };

    setSession(restoredSession);
    setStatus('authenticated');
  };

  /**
   * 实际执行登录的方法（内部使用）
   */
  const handleActualSignIn = async (): Promise<number | null> => {
    if (!oidcClient) {
      console.error('[MarketAuth] OIDC client not initialized');
      throw new MarketAuthError('oidcNotReady', { message: 'OIDC client not initialized' });
    }

    try {
      setStatus('loading');

      // 启动 OIDC 授权流程并获取授权码
      const authResult = await oidcClient.startAuthorization();

      // 用授权码换取访问令牌
      const tokenResponse = await oidcClient.exchangeCodeForToken(
        authResult.code,
        authResult.state,
      );

      // 获取用户信息
      const userInfo = await fetchUserInfo(tokenResponse.accessToken);

      // 创建会话对象
      const expiresAt = Date.now() + tokenResponse.expiresIn * 1000;
      const newSession: MarketAuthSession = {
        accessToken: tokenResponse.accessToken,
        expiresAt,
        expiresIn: tokenResponse.expiresIn,
        scope: tokenResponse.scope,
        tokenType: tokenResponse.tokenType as 'Bearer',
        userInfo: userInfo || undefined,
      };

      // 存储 tokens 到 DB
      await saveMarketTokensToDB(tokenResponse.accessToken, tokenResponse.refreshToken, expiresAt);

      setSession(newSession);
      setStatus('authenticated');

      // Check if user needs to set up profile (first-time login)
      if (userInfo?.sub) {
        const needsSetup = await checkNeedsProfileSetup(userInfo.sub);
        if (needsSetup) {
          setIsFirstTimeSetup(true);
          setShowProfileSetupModal(true);
        }
      }

      return userInfo?.accountId ?? null;
    } catch (error) {
      setStatus('unauthenticated');

      // 根据错误类型显示不同的错误消息
      if (error instanceof MarketAuthError) {
        message.error(t(`errors.${error.code}`) || t('errors.general'));
      } else {
        message.error(t('errors.general'));
      }

      throw error;
    }
  };

  /**
   * 登录方法（会先弹出确认对话框）
   */
  const signIn = async (): Promise<number | null> => {
    return new Promise<number | null>((resolve, reject) => {
      setPendingSignInResolve(() => resolve);
      setPendingSignInReject(() => reject);
      setShowConfirmModal(true);
    });
  };

  /**
   * 处理确认授权
   */
  const handleConfirmAuth = async () => {
    setShowConfirmModal(false);
    try {
      const result = await handleActualSignIn();
      if (pendingSignInResolve) {
        pendingSignInResolve(result);
        setPendingSignInResolve(null);
        setPendingSignInReject(null);
      }
    } catch (error) {
      if (pendingSignInReject) {
        pendingSignInReject(error);
        setPendingSignInResolve(null);
        setPendingSignInReject(null);
      }
    }
  };

  /**
   * 处理取消授权
   */
  const handleCancelAuth = () => {
    setShowConfirmModal(false);
    if (pendingSignInReject) {
      pendingSignInReject(new Error('User cancelled authorization'));
      setPendingSignInResolve(null);
      setPendingSignInReject(null);
    }
  };

  /**
   * 登出方法
   */
  const signOut = async () => {
    setSession(null);
    setStatus('unauthenticated');
    await clearMarketTokensFromDB();
  };

  /**
   * 获取当前用户信息
   */
  const getCurrentUserInfo = (): MarketUserInfo | null => {
    return session?.userInfo ?? null;
  };

  /**
   * 获取 access token（优先从 session 获取，否则从 DB 获取）
   */
  const getAccessToken = (): string | null => {
    // 优先从 session 获取（内存中的状态）
    if (session?.accessToken) {
      return session.accessToken;
    }

    // 备选从 DB 获取
    const dbTokens = getMarketTokensFromDB();
    return dbTokens?.accessToken ?? null;
  };

  /**
   * 打开个人资料设置模态框（用于用户手动编辑）
   */
  const openProfileSetup = useCallback(() => {
    setIsFirstTimeSetup(false);
    setShowProfileSetupModal(true);
  }, []);

  /**
   * 关闭个人资料设置模态框
   */
  const handleCloseProfileSetup = useCallback(() => {
    setShowProfileSetupModal(false);
    setIsFirstTimeSetup(false);
  }, []);

  /**
   * 个人资料更新成功回调
   */
  const handleProfileUpdateSuccess = useCallback(() => {
    // Profile is updated, modal will close automatically
  }, []);

  /**
   * 初始化时恢复会话并获取用户信息
   * 等待 isUserStateInit 为 true，此时 useInitUserState 的 SWR 请求已完成，settings 数据已加载
   */
  useEffect(() => {
    if (isUserStateInit) {
      initializeSession();
    }
  }, [isUserStateInit]);

  const contextValue: MarketAuthContextType = {
    getAccessToken,
    getCurrentUserInfo,
    getRefreshToken,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    openProfileSetup,
    refreshToken,
    session,
    signIn,
    signOut,
    status,
  };

  // Get current user's profile for the edit modal
  const userInfo = session?.userInfo;
  const username = userInfo?.sub;
  const { data: userProfile, mutate: mutateUserProfile } = useMarketUserProfile(username);

  // Handle profile update success - also refresh the cached profile
  const handleProfileSuccess = useCallback(
    (profile: MarketUserProfile) => {
      handleProfileUpdateSuccess();
      // Update the SWR cache with the new profile
      mutateUserProfile(profile, false);
    },
    [handleProfileUpdateSuccess, mutateUserProfile],
  );

  return (
    <MarketAuthContext.Provider value={contextValue}>
      {children}
      <MarketAuthConfirmModal
        onCancel={handleCancelAuth}
        onConfirm={handleConfirmAuth}
        open={showConfirmModal}
      />
      <ProfileSetupModal
        accessToken={session?.accessToken ?? null}
        defaultDisplayName={userProfile?.displayName || ''}
        isFirstTimeSetup={isFirstTimeSetup}
        onClose={handleCloseProfileSetup}
        onSuccess={handleProfileSuccess}
        open={showProfileSetupModal}
        userProfile={userProfile}
      />
    </MarketAuthContext.Provider>
  );
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
