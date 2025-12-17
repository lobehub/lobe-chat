import { useDebounce } from 'ahooks';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useSWR from 'swr';

import type { SearchResult } from '@/database/repositories/search';
import { lambdaClient } from '@/libs/trpc/client';
import { useAgentStore } from '@/store/agent';
import { builtinAgentSelectors } from '@/store/agent/selectors/builtinAgentSelectors';
import { useGlobalStore } from '@/store/global';
import { globalHelpers } from '@/store/global/helpers';
import { useHomeStore } from '@/store/home';

import type { ThemeMode } from './types';
import { detectContext } from './utils/context';

export const useCommandMenu = () => {
  const [open, setOpen] = useGlobalStore((s) => [s.status.showCommandMenu, s.updateSystemStatus]);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [pages, setPages] = useState<string[]>([]);

  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const switchThemeMode = useGlobalStore((s) => s.switchThemeMode);
  const createAgent = useAgentStore((s) => s.createAgent);
  const refreshAgentList = useHomeStore((s) => s.refreshAgentList);
  const inboxAgentId = useAgentStore(builtinAgentSelectors.inboxAgentId);

  const page = pages.at(-1);
  const isAiMode = page === 'ai-chat';

  // Detect context based on current pathname
  const context = useMemo(() => detectContext(pathname), [pathname]);

  // Extract agentId from pathname when in agent context
  const agentId = useMemo(() => {
    if (context?.type === 'agent') {
      const match = pathname.match(/^\/agent\/([^/?]+)/);
      return match?.[1] || undefined;
    }
    return undefined;
  }, [context, pathname]);

  // Debounce search input to reduce API calls
  const debouncedSearch = useDebounce(search, { wait: 300 });

  // Search functionality
  const hasSearch = debouncedSearch.trim().length > 0;
  const searchQuery = debouncedSearch.trim();

  const { data: searchResults, isLoading: isSearching } = useSWR<SearchResult[]>(
    hasSearch && !isAiMode ? ['search', searchQuery, agentId] : null,
    async () => {
      const locale = globalHelpers.getCurrentLanguage();
      return lambdaClient.search.query.query({ agentId, locale, query: searchQuery });
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  // Ensure we're mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Reset pages and search when opening/closing
  useEffect(() => {
    if (open) {
      setPages([]);
      setSearch('');
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

  const handleAskAI = () => {
    // Enter AI mode without adding messages
    setPages([...pages, 'ai-chat']);
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
    await createAgent({});
    await refreshAgentList();
    closeCommandMenu();
  };

  const navigateToPage = (pageName: string) => {
    setPages([...pages, pageName]);
  };

  return {
    closeCommandMenu,
    context,
    handleAskAI,
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
    navigateToPage,
    open,
    page,
    pages,
    pathname,
    search,
    searchResults: searchResults || ([] as SearchResult[]),
    setPages,
    setSearch,
  };
};
