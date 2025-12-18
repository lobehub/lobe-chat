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
  styles: {
    icon: string;
    itemContent: string;
    itemLabel: string;
  };
}

const MainMenu = memo<MainMenuProps>(
  ({
    context,
    onCreateSession,
    onExternalLink,
    onNavigate,
    onNavigateToTheme,
    pathname,
    styles,
  }) => {
    const { t } = useTranslation('common');

    return (
      <>
        {context && <ContextCommands context={context} onNavigate={onNavigate} styles={styles} />}

        <Command.Group>
          <Command.Item onSelect={onCreateSession} value="create new agent assistant">
            <Bot className={styles.icon} />
            <div className={styles.itemContent}>
              <div className={styles.itemLabel}>{t('cmdk.newAgent')}</div>
            </div>
          </Command.Item>

          {!pathname?.startsWith('/settings') && (
            <Command.Item onSelect={() => onNavigate('/settings')} value="settings">
              <Settings className={styles.icon} />
              <div className={styles.itemContent}>
                <div className={styles.itemLabel}>{t('cmdk.settings')}</div>
              </div>
            </Command.Item>
          )}

          <Command.Item onSelect={onNavigateToTheme} value="theme">
            <Monitor className={styles.icon} />
            <div className={styles.itemContent}>
              <div className={styles.itemLabel}>{t('cmdk.theme')}</div>
            </div>
          </Command.Item>
        </Command.Group>

        <Command.Group heading={t('cmdk.navigate')}>
          {!pathname?.startsWith('/community') && (
            <Command.Item onSelect={() => onNavigate('/community')} value="community">
              <Shapes className={styles.icon} />
              <div className={styles.itemContent}>
                <div className={styles.itemLabel}>{t('cmdk.community')}</div>
              </div>
            </Command.Item>
          )}
          {!pathname?.startsWith('/image') && (
            <Command.Item onSelect={() => onNavigate('/image')} value="painting">
              <Image className={styles.icon} />
              <div className={styles.itemContent}>
                <div className={styles.itemLabel}>{t('cmdk.painting')}</div>
              </div>
            </Command.Item>
          )}
          {!pathname?.startsWith('/knowledge') && (
            <Command.Item onSelect={() => onNavigate('/resource')} value="resource">
              <LibraryBig className={styles.icon} />
              <div className={styles.itemContent}>
                <div className={styles.itemLabel}>{t('cmdk.resource')}</div>
              </div>
            </Command.Item>
          )}
          {!pathname?.startsWith('/page') && (
            <Command.Item onSelect={() => onNavigate('/page')} value="page documents write">
              <FilePen className={styles.icon} />
              <div className={styles.itemContent}>
                <div className={styles.itemLabel}>{t('cmdk.pages')}</div>
              </div>
            </Command.Item>
          )}
          {!pathname?.startsWith('/memory') && (
            <Command.Item onSelect={() => onNavigate('/memory')} value="memory">
              <BrainCircuit className={styles.icon} />
              <div className={styles.itemContent}>
                <div className={styles.itemLabel}>{t('cmdk.memory')}</div>
              </div>
            </Command.Item>
          )}
        </Command.Group>

        <Command.Group heading={t('cmdk.about')}>
          <Command.Item
            onSelect={() =>
              onExternalLink('https://github.com/lobehub/lobe-chat/issues/new/choose')
            }
            value="submit-issue"
          >
            <Github className={styles.icon} />
            <div className={styles.itemContent}>
              <div className={styles.itemLabel}>{t('cmdk.submitIssue')}</div>
            </div>
          </Command.Item>
          <Command.Item
            onSelect={() => onExternalLink('https://github.com/lobehub/lobe-chat')}
            value="star-github"
          >
            <Star className={styles.icon} />
            <div className={styles.itemContent}>
              <div className={styles.itemLabel}>{t('cmdk.starOnGitHub')}</div>
            </div>
          </Command.Item>
          <Command.Item
            onSelect={() => onExternalLink('https://discord.gg/AYFPHvv2jT')}
            value="discord"
          >
            <DiscordIcon className={styles.icon} />
            <div className={styles.itemContent}>
              <div className={styles.itemLabel}>{t('cmdk.communitySupport')}</div>
            </div>
          </Command.Item>
        </Command.Group>
      </>
    );
  },
);

MainMenu.displayName = 'MainMenu';

export default MainMenu;
