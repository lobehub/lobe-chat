import { ActionIcon } from '@lobehub/ui';
import type { ActionIconGroupEvent, ActionIconGroupItemType } from '@lobehub/ui';
import { Dropdown, type MenuProps } from 'antd';
import { createStyles } from 'antd-style';
import { isValidElement, memo, useCallback, useMemo } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ActionMenuItem extends ActionIconGroupItemType {
  children?: { key: string; label: ReactNode }[];
  disable?: boolean;
  popupClassName?: string;
}

type MenuItem = ActionMenuItem | { type: 'divider' };
type ContextMenuEvent = ActionIconGroupEvent & { selectedText?: string };

const useStyles = createStyles(({ css }) => ({
  contextMenu: css`
    position: fixed;
    z-index: 1000;
    min-width: 160px;

    .ant-dropdown-menu {
      border: none;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 15%);
    }
  `,
  trigger: css`
    pointer-events: none;

    position: fixed;

    width: 1px;
    height: 1px;

    opacity: 0;
  `,
}));

interface ContextMenuProps {
  items: MenuItem[];
  onMenuClick: (action: ContextMenuEvent) => void;
  position: { x: number; y: number };
  selectedText?: string;
  visible: boolean;
}

const ContextMenu = memo<ContextMenuProps>(
  ({ visible, position, selectedText, onMenuClick, items }) => {
    const { styles } = useStyles();

    const renderIcon = useCallback((iconComponent: ActionIconGroupItemType['icon']) => {
      if (!iconComponent) return null;

      if (isValidElement(iconComponent)) {
        return <ActionIcon icon={iconComponent} size={'small'} />;
      }

      const IconComponent = iconComponent as ComponentType<{ size?: number }>;

      return <ActionIcon icon={<IconComponent size={16} />} size={'small'} />;
    }, []);

    const menuItems = useMemo(() => {
      return (items ?? []).filter(Boolean).map((item) => {
        if ('type' in item && item.type === 'divider') return { type: 'divider' as const };

        const actionItem = item as ActionMenuItem;
        const children = actionItem.children?.map((child) => ({
          key: child.key,
          label: child.label,
        }));
        const disabled =
          actionItem.disabled ??
          (typeof actionItem.disable === 'boolean' ? actionItem.disable : undefined);

        return {
          children,
          danger: actionItem.danger,
          disabled,
          icon: renderIcon(actionItem.icon),
          key: actionItem.key,
          label: actionItem.label,
          popupClassName: actionItem.popupClassName,
        };
      });
    }, [items, renderIcon]);

    const handleMenuClick = useCallback(
      (info: Parameters<NonNullable<MenuProps['onClick']>>[0]) => {
        const event = {
          ...info,
          selectedText,
        } as ContextMenuEvent;

        onMenuClick(event);
      },
      [onMenuClick, selectedText],
    );

    if (!visible) return null;

    return createPortal(
      <>
        <div
          className={styles.trigger}
          style={{
            left: position.x,
            top: position.y,
          }}
        />
        <Dropdown
          menu={{
            items: menuItems,
            onClick: handleMenuClick,
          }}
          open={visible}
          placement="bottomLeft"
          trigger={[]}
        >
          <div
            className={styles.contextMenu}
            style={{
              left: position.x,
              top: position.y,
            }}
          />
        </Dropdown>
      </>,
      document.body,
    );
  },
);

ContextMenu.displayName = 'ContextMenu';

export default ContextMenu;
