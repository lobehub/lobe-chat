'use client';

import { Command } from 'cmdk';
import { memo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useGlobalStore } from '@/store/global';

import { CommandMenuProvider, useCommandMenuContext } from './CommandMenuContext';
import MainMenu from './MainMenu';
import SearchResults from './SearchResults';
import ThemeMenu from './ThemeMenu';
import CommandFooter from './components/CommandFooter';
import CommandInput from './components/CommandInput';
import { useStyles } from './styles';
import { useCommandMenu } from './useCommandMenu';

/**
 * Inner component that uses the context
 */
const CommandMenuContent = memo(() => {
  const { t } = useTranslation('common');
  const { styles } = useStyles();
  const {
    closeCommandMenu,
    handleAskAISubmit,
    handleBack,
    hasSearch,
    isAiMode,
    isSearching,
    searchQuery,
    searchResults,
  } = useCommandMenu();

  const { viewMode, setPages, page, pages, search, setTypeFilter, typeFilter } =
    useCommandMenuContext();

  return (
    <div className={styles.overlay} onClick={closeCommandMenu}>
      <div onClick={(e) => e.stopPropagation()}>
        <Command
          className={styles.commandRoot}
          onKeyDown={(e) => {
            // Tab key to ask AI when not in AI mode
            if (e.key === 'Tab' && viewMode !== 'ai-chat') {
              e.preventDefault();

              setPages([...pages, 'ai-chat']);

              return;
            }
            // Enter key in AI mode to submit
            if (e.key === 'Enter' && viewMode === 'ai-chat') {
              e.preventDefault();
              handleAskAISubmit();
              return;
            }
            // Escape goes to previous page or closes
            if (e.key === 'Escape') {
              e.preventDefault();
              if (pages.length > 0) {
                handleBack();
              } else {
                closeCommandMenu();
              }
            }
            // Backspace goes to previous page when search is empty
            if (e.key === 'Backspace' && !search && pages.length > 0) {
              e.preventDefault();
              setPages((prev) => prev.slice(0, -1));
            }
          }}
          shouldFilter={viewMode !== 'ai-chat'}
        >
          <CommandInput />

          <Command.List>
            {!isAiMode && !isSearching && <Command.Empty>{t('cmdk.noResults')}</Command.Empty>}

            {!page && <MainMenu />}

            {page === 'theme' && <ThemeMenu />}

            {!page && hasSearch && !isAiMode && (
              <SearchResults
                isLoading={isSearching}
                onClose={closeCommandMenu}
                onSetTypeFilter={setTypeFilter}
                results={searchResults}
                searchQuery={searchQuery}
                typeFilter={typeFilter}
              />
            )}
          </Command.List>

          <CommandFooter />
        </Command>
      </div>
    </div>
  );
});

CommandMenuContent.displayName = 'CommandMenuContent';

/**
 * CMDK Menu.
 *
 * Search everything in LobeHub.
 */
const CommandMenu = memo(() => {
  const [open] = useGlobalStore((s) => [s.status.showCommandMenu]);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;

  // Ensure we're mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !open) return null;

  return createPortal(
    <CommandMenuProvider pathname={pathname}>
      <CommandMenuContent />
    </CommandMenuProvider>,
    document.body,
  );
});

CommandMenu.displayName = 'CommandMenu';

export default CommandMenu;
