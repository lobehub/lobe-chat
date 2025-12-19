'use client';

import { Command } from 'cmdk';
import { memo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import MainMenu from './MainMenu';
import SearchResults from './SearchResults';
import ThemeMenu from './ThemeMenu';
import CommandFooter from './components/CommandFooter';
import CommandInput from './components/CommandInput';
import { useStyles } from './styles';
import { useCommandMenu } from './useCommandMenu';

// type MenuViewMode = 'default' | 'search' | 'ai-chat';

/**
 * CMDK Menu.
 *
 * Search everything in LobeHub.
 */
const CommandMenu = memo(() => {
  const { t } = useTranslation('common');
  const { styles } = useStyles();
  const {
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
    searchResults,
    setPages,
    setSearch,
  } = useCommandMenu();

  if (!mounted || !open) return null;

  return createPortal(
    <div className={styles.overlay} onClick={closeCommandMenu}>
      <div onClick={(e) => e.stopPropagation()}>
        <Command
          className={styles.commandRoot}
          onKeyDown={(e) => {
            // Tab key to ask AI when not in AI mode
            if (e.key === 'Tab' && !isAiMode) {
              e.preventDefault();
              handleAskAI();
              return;
            }
            // Enter key in AI mode to submit
            if (e.key === 'Enter' && isAiMode) {
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
          shouldFilter={!isAiMode}
        >
          <CommandInput
            context={context}
            hasPages={pages.length > 0}
            isAiMode={isAiMode}
            onBack={handleBack}
            onValueChange={setSearch}
            search={search}
          />

          <Command.List>
            {!isAiMode && !isSearching && <Command.Empty>{t('cmdk.noResults')}</Command.Empty>}

            {!page && (
              <MainMenu
                context={context}
                onCreateSession={handleCreateSession}
                onExternalLink={handleExternalLink}
                onNavigate={handleNavigate}
                onNavigateToTheme={() => navigateToPage('theme')}
                pathname={pathname}
                styles={styles}
              />
            )}

            {page === 'theme' && <ThemeMenu onThemeChange={handleThemeChange} styles={styles} />}

            {!page && hasSearch && !isAiMode && (
              <SearchResults
                context={context}
                isLoading={isSearching}
                onClose={closeCommandMenu}
                results={searchResults}
                searchQuery={search}
                styles={styles}
              />
            )}
          </Command.List>

          <CommandFooter />
        </Command>
      </div>
    </div>,
    document.body,
  );
});

CommandMenu.displayName = 'CommandMenu';

export default CommandMenu;
