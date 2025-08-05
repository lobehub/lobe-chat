import { useEffect } from 'react';

import { useAiInfraStore } from '@/store/aiInfra';
import { useUserStore } from '@/store/user';

/**
 * AI基础设施初始化 Hook
 * 负责在应用启动时获取模型和提供商数据
 */
export const useAiInfraInit = () => {
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const isInitialized = useUserStore((s) => s.isInitialized);

  // 获取SWR hooks
  const useFetchAiProviderRuntimeState = useAiInfraStore((s) => s.useFetchAiProviderRuntimeState);
  const useFetchAiProviderList = useAiInfraStore((s) => s.useFetchAiProviderList);

  // 调用API获取数据
  const {
    data: runtimeState,
    error: runtimeError,
    isLoading: runtimeLoading,
  } = useFetchAiProviderRuntimeState(isAuthenticated);

  const {
    data: providerList,
    error: providerError,
    isLoading: providerLoading,
  } = useFetchAiProviderList();

  // 总的加载状态
  const isLoading = runtimeLoading || providerLoading;
  const hasError = runtimeError || providerError;

  // 日志记录错误
  useEffect(() => {
    if (runtimeError) {
      console.warn('Failed to fetch AI provider runtime state:', runtimeError);
    }
    if (providerError) {
      console.warn('Failed to fetch AI provider list:', providerError);
    }
  }, [runtimeError, providerError]);

  return {
    hasError,
    isAuthenticated,
    isInitialized,
    isLoading,
    providerList,
    runtimeState,
  };
};
