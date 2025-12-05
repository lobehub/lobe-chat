import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useSWR from 'swr';

import type { SearchResult } from '@/database/repositories/search';
import { useHotkeyById } from '@/hooks/useHotkeys/useHotkeyById';
import { lambdaClient } from '@/libs/trpc/client';
import { useGlobalStore } from '@/store/global';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useSessionStore } from '@/store/session';
import { HotkeyEnum } from '@/types/hotkey';

import type { ChatMessage, ThemeMode } from './types';

export const useCommandMenu = () => {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [pages, setPages] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const switchThemeMode = useGlobalStore((s) => s.switchThemeMode);
  const createSession = useSessionStore((s) => s.createSession);
  const { showCreateSession } = useServerConfigStore(featureFlagsSelectors);

  const page = pages.at(-1);
  const isAiMode = page === 'ai-chat';

  // Search functionality
  const hasSearch = search.trim().length > 0;
  const searchQuery = search.trim();

  const { data: searchResults, isLoading: isSearching } = useSWR<SearchResult[]>(
    hasSearch && !isAiMode ? ['search', searchQuery] : null,
    async () => {
      return lambdaClient.search.query.query({ query: searchQuery });
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

  // Register Cmd+K / Ctrl+K hotkey
  useHotkeyById(HotkeyEnum.CommandPalette, () => {
    setOpen((prev) => !prev);
  });

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

  // Reset pages, search, and chat when opening/closing
  useEffect(() => {
    if (open) {
      setPages([]);
      setSearch('');
      setChatMessages([]);
    }
  }, [open]);

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setOpen(false);
  };

  const handleThemeChange = (theme: ThemeMode) => {
    switchThemeMode(theme);
    setOpen(false);
  };

  const handleAskAI = () => {
    // Allow entering AI mode even without content
    if (search.trim()) {
      const userMessage: ChatMessage = {
        content: search,
        id: Date.now().toString(),
        role: 'user',
      };
      setChatMessages((prev) => [...prev, userMessage]);
    }
    setPages([...pages, 'ai-chat']);
  };

  const handleBack = () => {
    // If exiting AI mode, restore the last user message
    if (isAiMode && chatMessages.length > 0) {
      const lastUserMessage = chatMessages.at(-1);
      if (lastUserMessage?.role === 'user') {
        setSearch(lastUserMessage.content);
      }
    }
    setPages((prev) => prev.slice(0, -1));
  };

  const handleCreateSession = () => {
    createSession();
    setOpen(false);
  };

  const navigateToPage = (pageName: string) => {
    setPages([...pages, pageName]);
  };

  return {
    chatMessages,
    handleAskAI,
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
    setOpen,
    setPages,
    setSearch,
    showCreateSession,
  };
};
