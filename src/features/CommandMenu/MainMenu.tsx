import { DiscordIcon } from '@lobehub/ui/icons';
import { Command } from 'cmdk';
import {
  Bot,
  BrainCircuit,
  FilePen,
  Github,
  Image,
  LibraryBig,
  Monitor,
  Settings,
  Shapes,
  Star,
} from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { SOCIAL_URL } from '@/const/branding';
import { FEEDBACK } from '@/const/url';

import { useCommandMenuContext } from './CommandMenuContext';
import ContextCommands from './ContextCommands';
import { CommandItem } from './components';
import { useCommandMenu } from './useCommandMenu';

const MainMenu = memo(() => {
  const { pathname, menuContext, setPages, pages } = useCommandMenuContext();
  const { t } = useTranslation('common');

  const { handleCreateSession, handleNavigate, handleExternalLink } = useCommandMenu();

  return (
    <>
      <ContextCommands />

      <Command.Group>
        <CommandItem
          icon={<Bot />}
          onSelect={handleCreateSession}
          value="create new agent assistant"
        >
          {t('cmdk.newAgent')}
        </CommandItem>

        {menuContext === 'resource' && (
          <CommandItem icon={<Bot />} onSelect={handleCreateSession} value="create new library">
            {t('cmdk.newLibrary')}
          </CommandItem>
        )}

        {menuContext !== 'settings' && (
          <CommandItem
            icon={<Settings />}
            onSelect={() => handleNavigate('/settings')}
            value="settings"
          >
            {t('cmdk.settings')}
          </CommandItem>
        )}

        <CommandItem icon={<Monitor />} onSelect={() => setPages([...pages, 'theme'])} value="theme">
          {t('cmdk.theme')}
        </CommandItem>
      </Command.Group>

      <Command.Group heading={t('cmdk.navigate')}>
        {!pathname?.startsWith('/community') && (
          <CommandItem
            icon={<Shapes />}
            onSelect={() => handleNavigate('/community')}
            value="community"
          >
            {t('cmdk.community')}
          </CommandItem>
        )}
        {!pathname?.startsWith('/image') && (
          <CommandItem icon={<Image />} onSelect={() => handleNavigate('/image')} value="painting">
            {t('cmdk.painting')}
          </CommandItem>
        )}
        {!pathname?.startsWith('/knowledge') && (
          <CommandItem
            icon={<LibraryBig />}
            onSelect={() => handleNavigate('/resource')}
            value="resource"
          >
            {t('cmdk.resource')}
          </CommandItem>
        )}
        {!pathname?.startsWith('/page') && (
          <CommandItem
            icon={<FilePen />}
            onSelect={() => handleNavigate('/page')}
            value="page documents write"
          >
            {t('cmdk.pages')}
          </CommandItem>
        )}
        {!pathname?.startsWith('/memory') && (
          <CommandItem
            icon={<BrainCircuit />}
            onSelect={() => handleNavigate('/memory')}
            value="memory"
          >
            {t('cmdk.memory')}
          </CommandItem>
        )}
      </Command.Group>

      <Command.Group heading={t('cmdk.about')}>
        <CommandItem
          icon={<Github />}
          onSelect={() => handleExternalLink(FEEDBACK)}
          value="submit-issue"
        >
          {t('cmdk.submitIssue')}
        </CommandItem>
        <CommandItem
          icon={<Star />}
          onSelect={() => handleExternalLink(SOCIAL_URL.github)}
          value="star-github"
        >
          {t('cmdk.starOnGitHub')}
        </CommandItem>
        <CommandItem
          icon={<DiscordIcon />}
          onSelect={() => handleExternalLink(SOCIAL_URL.discord)}
          value="discord"
        >
          {t('cmdk.communitySupport')}
        </CommandItem>
      </Command.Group>
    </>
  );
});

MainMenu.displayName = 'MainMenu';

export default MainMenu;
