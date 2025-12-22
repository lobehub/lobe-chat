import { Command } from 'cmdk';
import type { ComponentProps, ReactNode } from 'react';
import { cloneElement, isValidElement, memo } from 'react';

import { useStyles } from '../styles';

type BaseCommandItemProps = Omit<ComponentProps<typeof Command.Item>, 'children'>;

type SimpleCommandItemProps = BaseCommandItemProps & {
  children: ReactNode;
  icon: ReactNode;
  variant?: 'simple';
};

type DetailedCommandItemProps = BaseCommandItemProps & {
  description?: ReactNode;
  icon: ReactNode;
  title: ReactNode;
  trailingLabel?: ReactNode;
  variant: 'detailed';
};

type CommandItemProps = SimpleCommandItemProps | DetailedCommandItemProps;

/**
 * Wrapper component for Command.Item that centralizes style management
 */
const CommandItem = memo<CommandItemProps>((props) => {
  const { styles } = useStyles();

  if (props.variant === 'detailed') {
    const { icon, title, description, trailingLabel, variant, ...itemProps } = props;
    return (
      <Command.Item {...itemProps}>
        <div className={styles.itemContent}>
          <div className={styles.itemIcon}>{icon}</div>
          <div className={styles.itemDetails}>
            <div className={styles.itemTitle}>{title}</div>
            {description && <div className={styles.itemDescription}>{description}</div>}
          </div>
          {trailingLabel && <div className={styles.itemType}>{trailingLabel}</div>}
        </div>
      </Command.Item>
    );
  }

  // Simple variant (default)
  const { icon, children, variant, ...itemProps } = props;

  // Clone the icon element and add the icon className if it's a valid React element
  const iconWithClass =
    isValidElement(icon) && typeof icon.type !== 'string'
      ? cloneElement(icon, { className: styles.icon } as never)
      : icon;

  return (
    <Command.Item {...itemProps}>
      {iconWithClass}
      <div className={styles.itemContent}>
        <div className={styles.itemLabel}>{children}</div>
      </div>
    </Command.Item>
  );
});

CommandItem.displayName = 'CommandItem';

export default CommandItem;
