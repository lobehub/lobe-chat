import { Menu } from 'antd';
import { createStyles } from 'antd-style';
import { Quote } from 'lucide-react';
import {ActionIcon } from '@lobehub/ui'
import { memo, useMemo, useCallback, isValidElement } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';

import { useChatListActionsBar } from '../../hooks/useChatListActionsBar';

const useStyles = createStyles(({ css }) => ({
  contextMenu: css`
    position: fixed;
    z-index: 1000;
    min-width: 160px;
    
    .ant-menu {
      border: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border-radius: 6px;
    }
  `,
}));

interface ContextMenuProps {
  onMenuClick: (action: any) => void;
  position: { x: number; y: number };
  selectedText?: string;
  visible: boolean;
}

const ContextMenu = memo<ContextMenuProps>(({ visible, position, selectedText, onMenuClick }) => {
  const { styles } = useStyles();
  const { t } = useTranslation('common');
  const { regenerate, edit, copy, del, branching, delAndRegenerate, export: exportAction, share } = useChatListActionsBar();

  const renderIcon = useCallback((IconComponent: any) => {
    console.log("IconComponent", IconComponent)
    return <ActionIcon icon={<IconComponent size={16} />} size={'small'} />
    return <IconComponent size={16} />
    if (!IconComponent) return null;
    if (typeof IconComponent === 'function') {
      return <IconComponent size={16} />;
    }
    // 如果是已经渲染的 React 元素，直接返回
    if (isValidElement(IconComponent)) {
      return IconComponent;
    }
    // 如果是字符串或其他类型，返回 null
    return null;
  }, []);

  const menuItems = useMemo(() => {
    const items: any[] = [];

    if (selectedText) {
      items.push({
        icon: renderIcon(Quote),
        key: 'quote',
        label: t('quote', { defaultValue: 'Quote' }),
      }, { type: 'divider' });
    }

    items.push(
      {
        icon: renderIcon(edit.icon),
        key: 'edit',
        label: edit.label,
      },
      {
        icon: renderIcon(copy.icon),
        key: 'copy',
        label: copy.label,
      },
      {
        icon: renderIcon(regenerate.icon),
        key: 'regenerate',
        label: regenerate.label,
      },
      {
        disabled: (branching as any).disable,
        icon: renderIcon(branching.icon),
        key: 'branching',
        label: branching.label,
      },
      {
        disabled: (delAndRegenerate as any).disable,
        icon: renderIcon(delAndRegenerate.icon),
        key: 'delAndRegenerate',
        label: delAndRegenerate.label,
      },
      {
        icon: renderIcon(exportAction.icon),
        key: 'export',
        label: exportAction.label,
      },
      {
        icon: renderIcon(share.icon),
        key: 'share',
        label: share.label,
      },
      { type: 'divider' },
      {
        danger: (del as any).danger,
        disabled: (del as any).disable,
        icon: renderIcon(del.icon),
        key: 'del',
        label: del.label,
      }
    );

    return items;
  }, [selectedText, t, edit, copy, regenerate, branching, delAndRegenerate, exportAction, share, del, renderIcon]);

  const handleMenuClick = useMemo(() => (info: any) => {
    onMenuClick({
      key: info.key,
      selectedText: selectedText,
    });
  }, [onMenuClick, selectedText]);

  if (!visible) return null;

  return createPortal(
    <div
      className={styles.contextMenu}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <Menu
        items={menuItems}
        mode="vertical"
        onClick={handleMenuClick}
        selectable={false}
      />
    </div>,
    document.body
  );
});

ContextMenu.displayName = 'ContextMenu';

export default ContextMenu;