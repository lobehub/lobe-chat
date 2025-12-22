import { Command } from 'cmdk';
import { ChevronRight } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { CommandItem } from './components';
import type { Context } from './types';
import { getContextCommands } from './utils/contextCommands';

interface ContextCommandsProps {
  context: Context;
  onNavigate: (path: string) => void;
}

const ContextCommands = memo<ContextCommandsProps>(({ context, onNavigate }) => {
  const { t } = useTranslation('setting');
  const { t: tAuth } = useTranslation('auth');
  const { t: tCommon } = useTranslation('common');
  const { t: tChat } = useTranslation('chat');
  const commands = getContextCommands(context.type, context.subPath);

  if (commands.length === 0) return null;

  // Get localized context name
  const getContextName = () => {
    switch (context.type) {
      case 'settings': {
        return t('header.title', { defaultValue: context.name });
      }
      case 'agent': {
        return tCommon('cmdk.search.agent', { defaultValue: context.name });
      }
      case 'group': {
        return tChat('group.title', { defaultValue: context.name });
      }
      case 'page': {
        return tCommon('cmdk.pages', { defaultValue: context.name });
      }
      case 'painting': {
        return tCommon('cmdk.painting', { defaultValue: context.name });
      }
      case 'resource': {
        return tCommon('cmdk.resource', { defaultValue: context.name });
      }
      default: {
        return context.name;
      }
    }
  };

  const contextName = getContextName();

  return (
    <Command.Group>
      {commands.map((cmd) => {
        const Icon = cmd.icon;
        // Get localized label using the correct namespace
        let label = cmd.label;
        if (cmd.labelKey) {
          if (cmd.labelNamespace === 'auth') {
            label = tAuth(cmd.labelKey, { defaultValue: cmd.label });
          } else {
            label = t(cmd.labelKey, { defaultValue: cmd.label });
          }
        }
        const searchValue = `${contextName} ${label} ${cmd.keywords.join(' ')}`;

        return (
          <CommandItem icon={<Icon />} key={cmd.path} onSelect={() => onNavigate(cmd.path)} value={searchValue}>
            <span style={{ opacity: 0.5 }}>{contextName}</span>
            <ChevronRight
              size={14}
              style={{
                display: 'inline',
                marginInline: '6px',
                opacity: 0.5,
                verticalAlign: 'middle',
              }}
            />
            {label}
          </CommandItem>
        );
      })}
    </Command.Group>
  );
});

ContextCommands.displayName = 'ContextCommands';

export default ContextCommands;
