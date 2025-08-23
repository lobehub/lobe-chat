import { useEffect, useState } from 'react';

import { useMarketAuth } from '@/layout/AuthProvider/MarketAuth';
import { marketApiService } from '@/services/marketApi';

interface AgentOwnershipResult {
  // null = loading, true = 是用户的, false = 不是用户的
  error?: string;
  isOwnAgent: boolean | null;
}

// 简单的缓存机制避免重复 API 调用
const agentOwnershipCache = new Map<string, { result: boolean; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

/**
 * 获取当前用户 ID
 */
function getCurrentAccountId(marketAuth: any): string | null {
  try {
    // 首先尝试从 marketAuth 中获取用户信息
    const userInfo = marketAuth.getCurrentUserInfo?.();
    if (userInfo?.sub) {
      console.log('[useAgentOwnershipCheck] User ID from userInfo:', userInfo.accountId);
      return userInfo.accountId;
    }

    // 如果没有，尝试从 sessionStorage 中获取
    const userInfoData = sessionStorage.getItem('market_user_info');
    if (userInfoData) {
      const parsedUserInfo = JSON.parse(userInfoData);
      console.log('[useAgentOwnershipCheck] User ID from sessionStorage:', parsedUserInfo.sub);
      return parsedUserInfo.sub;
    }

    console.warn('[useAgentOwnershipCheck] No user ID found');
    return null;
  } catch (error) {
    console.error('[useAgentOwnershipCheck] Failed to get current user ID:', error);
    return null;
  }
}

/**
 * 检查当前用户是否拥有指定的 agent
 */
export const useAgentOwnershipCheck = (marketIdentifier?: string): AgentOwnershipResult => {
  const [result, setResult] = useState<AgentOwnershipResult>({ isOwnAgent: null });
  const marketAuth = useMarketAuth();
  const { session, isAuthenticated } = marketAuth;

  useEffect(() => {
    if (!marketIdentifier || !isAuthenticated || !session) {
      setResult({ isOwnAgent: false });
      return;
    }

    const checkOwnership = async () => {
      try {
        console.log('[useAgentOwnershipCheck] Checking ownership for:', marketIdentifier);

        // 检查缓存
        const cached = agentOwnershipCache.get(marketIdentifier);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          console.log('[useAgentOwnershipCheck] Using cached result:', cached.result);
          setResult({ isOwnAgent: cached.result });
          return;
        }

        // 设置 API 的 access token
        marketApiService.setAccessToken(session.accessToken);

        // 调用 API 获取 agent 详情
        const agentDetail = await marketApiService.getAgentDetail(marketIdentifier);
        console.log('[useAgentOwnershipCheck] Agent detail:', agentDetail);

        // 获取当前用户 ID
        const currentAccountId = getCurrentAccountId(marketAuth);
        console.log('[useAgentOwnershipCheck] Current user ID:', currentAccountId);

        if (!currentAccountId) {
          console.warn('[useAgentOwnershipCheck] Could not get current user ID');
          setResult({ isOwnAgent: false });
          return;
        }

        console.log('agentDetail', agentDetail);

        // 对比用户 ID (支持多种字段名)
        const isOwner =
          agentDetail.userId === currentAccountId ||
          agentDetail.clerkId === currentAccountId ||
          agentDetail.ownerId === currentAccountId ||
          agentDetail.createdBy === currentAccountId;

        console.log('[useAgentOwnershipCheck] Ownership check result:', isOwner);

        // 缓存结果
        agentOwnershipCache.set(marketIdentifier, {
          result: isOwner,
          timestamp: Date.now(),
        });

        setResult({ isOwnAgent: isOwner });
      } catch (error) {
        console.error('[useAgentOwnershipCheck] Failed to check agent ownership:', error);

        // 错误处理策略：
        // 1. 网络错误 -> 默认显示 SubmitAgentButton（保守策略）
        // 2. 401/403 -> 用户无权限，显示 SubmitAgentButton
        // 3. 404 -> agent 不存在，显示 SubmitAgentButton
        setResult({
          error: error instanceof Error ? error.message : 'Unknown error',
          isOwnAgent: false,
        });
      }
    };

    checkOwnership();
  }, [marketIdentifier, isAuthenticated, session, marketAuth]);

  return result;
};
