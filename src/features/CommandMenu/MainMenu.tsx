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

import { CommandItem } from './components';
import ContextCommands from './ContextCommands';
import type { Context } from './types';

interface MainMenuProps {
  context?: Context;
  onCreateSession: () => void;
  onExternalLink: (url: string) => void;
  onNavigate: (path: string) => void;
  onNavigateToTheme: () => void;
  pathname: string | null;
  showCreateSession?: boolean;
}

const MainMenu = memo<MainMenuProps>(
  ({ context, onCreateSession, onExternalLink, onNavigate, onNavigateToTheme, pathname }) => {
    const { t } = useTranslation('common');

    return (
      <>
        {context && <ContextCommands context={context} onNavigate={onNavigate} />}

        <Command.Group>
          <CommandItem icon={<Bot />} onSelect={onCreateSession} value="create new agent assistant">
            {t('cmdk.newAgent')}
          </CommandItem>

          {!pathname?.startsWith('/settings') && (
            <CommandItem icon={<Settings />} onSelect={() => onNavigate('/settings')} value="settings">
              {t('cmdk.settings')}
            </CommandItem>
          )}

          <CommandItem icon={<Monitor />} onSelect={onNavigateToTheme} value="theme">
            {t('cmdk.theme')}
          </CommandItem>
        </Command.Group>

        <Command.Group heading={t('cmdk.navigate')}>
          {!pathname?.startsWith('/community') && (
            <CommandItem icon={<Shapes />} onSelect={() => onNavigate('/community')} value="community">
              {t('cmdk.community')}
            </CommandItem>
          )}
          {!pathname?.startsWith('/image') && (
            <CommandItem icon={<Image />} onSelect={() => onNavigate('/image')} value="painting">
              {t('cmdk.painting')}
            </CommandItem>
          )}
          {!pathname?.startsWith('/knowledge') && (
            <CommandItem icon={<LibraryBig />} onSelect={() => onNavigate('/resource')} value="resource">
              {t('cmdk.resource')}
            </CommandItem>
          )}
          {!pathname?.startsWith('/page') && (
            <CommandItem icon={<FilePen />} onSelect={() => onNavigate('/page')} value="page documents write">
              {t('cmdk.pages')}
            </CommandItem>
          )}
          {!pathname?.startsWith('/memory') && (
            <CommandItem icon={<BrainCircuit />} onSelect={() => onNavigate('/memory')} value="memory">
              {t('cmdk.memory')}
            </CommandItem>
          )}
        </Command.Group>

        <Command.Group heading={t('cmdk.about')}>
          <CommandItem
            icon={<Github />}
            onSelect={() =>
              onExternalLink('https://github.com/lobehub/lobe-chat/issues/new/choose')
            }
            value="submit-issue"
          >
            {t('cmdk.submitIssue')}
          </CommandItem>
          <CommandItem icon={<Star />} onSelect={() => onExternalLink(SOCIAL_URL.github)} value="star-github">
            {t('cmdk.starOnGitHub')}
          </CommandItem>
          <CommandItem icon={<DiscordIcon />} onSelect={() => onExternalLink(SOCIAL_URL.discord)} value="discord">
            {t('cmdk.communitySupport')}
          </CommandItem>
        </Command.Group>
      </>
    );
  },
);

MainMenu.displayName = 'MainMenu';

export default MainMenu;
