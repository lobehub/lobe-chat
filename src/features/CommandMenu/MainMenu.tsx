import { DiscordIcon } from '@lobehub/ui/icons';
import { Command } from 'cmdk';
import {
  Bot,
  BrainCircuit,
  FilePen,
  Github,
  Image,
  LibraryBig,
  MessageSquarePlusIcon,
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

  const {
    handleCreateSession,
    handleCreateTopic,
    handleCreateLibrary,
    handleNavigate,
    handleExternalLink,
  } = useCommandMenu();

  return (
    <>
      <ContextCommands />

      <Command.Group>
        {menuContext !== 'agent' && (
          <CommandItem
            icon={<Bot />}
            onSelect={handleCreateSession}
            value="create new agent assistant"
          >
            {t('cmdk.newAgent')}
          </CommandItem>
        )}

        {menuContext !== 'agent' && (
          <CommandItem icon={<Bot />} onSelect={handleCreateSession} value="create new agent team">
            Create New Agent Team
          </CommandItem>
        )}

        {menuContext !== 'page' && (
          <CommandItem icon={<Bot />} onSelect={handleCreateSession} value="create new page">
            Create New Page
          </CommandItem>
        )}

        {menuContext !== 'resource' && (
          <CommandItem icon={<Bot />} onSelect={handleCreateLibrary} value="create new library">
            {t('cmdk.newLibrary')}
          </CommandItem>
        )}

        {menuContext === 'agent' && (
          <CommandItem
            icon={<MessageSquarePlusIcon />}
            onSelect={handleCreateTopic}
            value="create new topic"
          >
            {t('cmdk.newTopic')}
          </CommandItem>
        )}

        {menuContext !== 'settings' && (
          <CommandItem
            icon={<Settings />}
            keywords={['settings', 'preferences', 'configuration', 'options']}
            onSelect={() => handleNavigate('/settings')}
            value="settings"
          >
            {t('cmdk.settings')}
          </CommandItem>
        )}

        <CommandItem
          icon={<Monitor />}
          onSelect={() => setPages([...pages, 'theme'])}
          value="theme"
        >
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
          keywords={['issue', 'bug', 'problem', 'feedback']}
          onSelect={() => handleExternalLink(FEEDBACK)}
          value="submit-issue"
        >
          {t('cmdk.submitIssue')}
        </CommandItem>
        <CommandItem
          icon={<Star />}
          keywords={['github', 'star', 'favorite', 'like']}
          onSelect={() => handleExternalLink(SOCIAL_URL.github)}
          value="star-github"
        >
          {t('cmdk.starOnGitHub')}
        </CommandItem>
        <CommandItem
          icon={<DiscordIcon />}
          keywords={['discord', 'help', 'support', 'customer service']}
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
