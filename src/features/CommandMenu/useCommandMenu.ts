import { useDebounce } from 'ahooks';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';

import type { SearchResult } from '@/database/repositories/search';
import { lambdaClient } from '@/libs/trpc/client';
import { useAgentStore } from '@/store/agent';
import { builtinAgentSelectors } from '@/store/agent/selectors/builtinAgentSelectors';
import { useGlobalStore } from '@/store/global';
import { globalHelpers } from '@/store/global/helpers';
import { useHomeStore } from '@/store/home';

import { useCommandMenuContext } from './CommandMenuContext';
import type { ThemeMode } from './types';

/**
 * Shared methods for CommandMenu
 */
export const useCommandMenu = () => {
  const [open, setOpen] = useGlobalStore((s) => [s.status.showCommandMenu, s.updateSystemStatus]);
  const {
    mounted,
    search,
    setSearch,
    pages,
    setPages,
    typeFilter,
    setTypeFilter,
    page,
    isAiMode,
    menuContext: context,
    pathname,
  } = useCommandMenuContext();

  const navigate = useNavigate();
  const switchThemeMode = useGlobalStore((s) => s.switchThemeMode);
  const createAgent = useAgentStore((s) => s.createAgent);
  const refreshAgentList = useHomeStore((s) => s.refreshAgentList);
  const inboxAgentId = useAgentStore(builtinAgentSelectors.inboxAgentId);

  // Extract agentId from pathname when in agent context
  const agentId = useMemo(() => {
    if (context === 'agent') {
      const match = pathname?.match(/^\/agent\/([^/?]+)/);
      return match?.[1] || undefined;
    }
    return undefined;
  }, [context, pathname]);

  // Debounce search input to reduce API calls
  const debouncedSearch = useDebounce(search, { wait: 600 });

  // Search functionality
  const hasSearch = debouncedSearch.trim().length > 0;
  const searchQuery = debouncedSearch.trim();

  const { data: searchResults, isLoading: isSearching } = useSWR<SearchResult[]>(
    hasSearch && !isAiMode ? ['search', searchQuery, agentId, typeFilter] : null,
    async () => {
      const locale = globalHelpers.getCurrentLanguage();
      return lambdaClient.search.query.query({
        agentId,
        limitPerType: typeFilter ? 50 : 5, // Show more results when filtering by type
        locale,
        query: searchQuery,
        type: typeFilter,
      });
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  // Close on Escape key and prevent body scroll
  useEffect(() => {
    if (open) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [open]);

  const closeCommandMenu = () => {
    setOpen({ showCommandMenu: false });
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    closeCommandMenu();
  };

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    closeCommandMenu();
  };

  const handleThemeChange = (theme: ThemeMode) => {
    switchThemeMode(theme);
    closeCommandMenu();
  };

  const handleAskAISubmit = () => {
    // Navigate to inbox agent with the message query parameter
    if (inboxAgentId && search.trim()) {
      const message = encodeURIComponent(search.trim());
      navigate(`/agent/${inboxAgentId}?message=${message}`);
      closeCommandMenu();
    }
  };

  const handleBack = () => {
    setPages((prev) => prev.slice(0, -1));
  };

  const handleCreateSession = async () => {
    const result = await createAgent({});
    await refreshAgentList();

    // Navigate to the newly created agent
    if (result.agentId) {
      navigate(`/agent/${result.agentId}`);
    }

    closeCommandMenu();
  };

  return {
    closeCommandMenu,
    handleAskAISubmit,
    handleBack,
    handleCreateSession,
    handleExternalLink,
    handleNavigate,
    handleThemeChange,
    hasSearch,
    isAiMode,
    isSearching,
    mounted,
    open,
    page,
    pages,
    pathname,
    search,
    searchQuery,
    searchResults: searchResults || ([] as SearchResult[]),
    setSearch,
    setTypeFilter,
    typeFilter,
  };
};
