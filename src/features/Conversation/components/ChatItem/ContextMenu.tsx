import { ActionIcon } from '@lobehub/ui';
import { Dropdown } from 'antd';
import { createStyles, css, cx } from 'antd-style';
import { memo, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { useCustomActions } from '../../Actions/customAction';
import { useChatListActionsBar } from '../../hooks/useChatListActionsBar';

const translateStyle = css`
  .ant-dropdown-menu-sub {
    overflow-y: scroll;
    max-height: 400px;
  }
`;

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
  onMenuClick: (action: any) => void;
  position: { x: number; y: number };
  role?: string;
  selectedText?: string;
  visible: boolean;
}

const ContextMenu = memo<ContextMenuProps>(
  ({ visible, position, selectedText, role, onMenuClick }) => {
    const { styles } = useStyles();
    const { t } = useTranslation('common');
    const { regenerate, edit, copy, del, branching, delAndRegenerate, share, quote } =
      useChatListActionsBar();
    const { translate, tts } = useCustomActions();

    const renderIcon = useCallback((IconComponent: any) => {
      return <ActionIcon icon={<IconComponent size={16} />} size={'small'} />;
    }, []);

    const menuItems = useMemo(() => {
      const items: any[] = [];
      items.push(
        {
          ...quote,
          icon: renderIcon(quote.icon),
        },
        { type: 'divider' },
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
          disabled: (branching as any).disable,
          icon: renderIcon(branching.icon),
          key: 'branching',
          label: branching.label,
        },
        { type: 'divider' },
        {
          icon: renderIcon(tts.icon),
          key: 'tts',
          label: tts.label,
        },
        {
          children: (translate as any).children?.map((child: any) => ({
            key: child.key,
            label: child.label,
          })),
          icon: renderIcon(translate.icon),
          key: 'translate',
          label: translate.label,
          popupClassName: cx(translateStyle),
        },
        { type: 'divider' },
        ...(role === 'assistant'
          ? [
              {
                icon: renderIcon(share.icon),
                key: 'share',
                label: share.label,
              },
              { type: 'divider' as const },
            ]
          : []),
        {
          icon: renderIcon(regenerate.icon),
          key: 'regenerate',
          label: regenerate.label,
        },
        {
          disabled: (delAndRegenerate as any).disable,
          icon: renderIcon(delAndRegenerate.icon),
          key: 'delAndRegenerate',
          label: delAndRegenerate.label,
        },
        { type: 'divider' },
        {
          danger: (del as any).danger,
          disabled: (del as any).disable,
          icon: renderIcon(del.icon),
          key: 'del',
          label: del.label,
        },
      );

      return items;
    }, [
      selectedText,
      t,
      edit,
      copy,
      branching,
      tts,
      translate,
      role,
      share,
      regenerate,
      delAndRegenerate,
      del,
      renderIcon,
    ]);

    const handleMenuClick = useMemo(
      () => (info: any) => {
        onMenuClick({
          key: info.key,
          keyPath: info.keyPath,
          selectedText: selectedText,
        });
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
