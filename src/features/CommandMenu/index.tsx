'use client';

import { Command } from 'cmdk';
import { memo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import ChatList from './ChatList';
import MainMenu from './MainMenu';
import ThemeMenu from './ThemeMenu';
import CommandFooter from './components/CommandFooter';
import CommandInput from './components/CommandInput';
import { useStyles } from './styles';
import { useCommandMenu } from './useCommandMenu';

const CommandMenu = memo(() => {
  const { t } = useTranslation('common');
  const { styles } = useStyles();
  const {
    chatMessages,
    handleAskAI,
    handleBack,
    handleCreateSession,
    handleExternalLink,
    handleNavigate,
    handleThemeChange,
    isAiMode,
    mounted,
    navigateToPage,
    open,
    page,
    pages,
    pathname,
    search,
    setOpen,
    setPages,
    setSearch,
    showCreateSession,
  } = useCommandMenu();

  if (!mounted || !open) return null;

  return createPortal(
    <div className={styles.overlay} onClick={() => setOpen(false)}>
      <div onClick={(e) => e.stopPropagation()}>
        <Command
          className={styles.commandRoot}
          onKeyDown={(e) => {
            // Tab key to ask AI when there's input text and not in AI mode
            if (e.key === 'Tab' && search.trim() && !isAiMode) {
              e.preventDefault();
              handleAskAI();
              return;
            }
            // Escape goes to previous page or closes
            if (e.key === 'Escape') {
              e.preventDefault();
              if (pages.length > 0) {
                handleBack();
              } else {
                setOpen(false);
              }
            }
            // Backspace goes to previous page when search is empty
            if (e.key === 'Backspace' && !search && pages.length > 0) {
              e.preventDefault();
              setPages((prev) => prev.slice(0, -1));
            }
          }}
          shouldFilter={true}
        >
          <CommandInput
            hasPages={pages.length > 0}
            isAiMode={isAiMode}
            onBack={handleBack}
            onValueChange={setSearch}
            search={search}
            styles={styles}
          />

          <Command.List>
            {!isAiMode && <Command.Empty>{t('cmdk.noResults')}</Command.Empty>}

            {!page && (
              <MainMenu
                onCreateSession={handleCreateSession}
                onExternalLink={handleExternalLink}
                onNavigate={handleNavigate}
                onNavigateToTheme={() => navigateToPage('theme')}
                pathname={pathname}
                showCreateSession={showCreateSession}
                styles={styles}
              />
            )}

            {page === 'theme' && <ThemeMenu onThemeChange={handleThemeChange} styles={styles} />}

            {isAiMode && <ChatList messages={chatMessages} styles={styles} />}
          </Command.List>

          <CommandFooter isAiMode={isAiMode} search={search} styles={styles} />
        </Command>
      </div>
    </div>,
    document.body,
  );
});

CommandMenu.displayName = 'CommandMenu';

export default CommandMenu;
