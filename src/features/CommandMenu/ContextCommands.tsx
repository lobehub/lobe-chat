import { Command } from 'cmdk';
import { ChevronRight } from 'lucide-react';
import { memo } from 'react';

import type { Context } from './types';
import { getContextCommands } from './utils/contextCommands';

interface ContextCommandsProps {
  context: Context;
  onNavigate: (path: string) => void;
  styles: {
    icon: string;
    itemContent: string;
    itemLabel: string;
  };
}

const ContextCommands = memo<ContextCommandsProps>(({ context, onNavigate, styles }) => {
  const commands = getContextCommands(context.type, context.subPath);

  if (commands.length === 0) return null;

  return (
    <Command.Group>
      {commands.map((cmd) => {
        const Icon = cmd.icon;
        const searchValue = `${context.name} ${cmd.label} ${cmd.keywords.join(' ')}`;

        return (
          <Command.Item key={cmd.path} onSelect={() => onNavigate(cmd.path)} value={searchValue}>
            <Icon className={styles.icon} />
            <div className={styles.itemContent}>
              <div className={styles.itemLabel}>
                <span style={{ opacity: 0.5 }}>{context.name}</span>
                <ChevronRight
                  size={14}
                  style={{
                    display: 'inline',
                    marginInline: '6px',
                    opacity: 0.5,
                    verticalAlign: 'middle',
                  }}
                />
                {cmd.label}
              </div>
            </div>
          </Command.Item>
        );
      })}
    </Command.Group>
  );
});

ContextCommands.displayName = 'ContextCommands';

export default ContextCommands;
