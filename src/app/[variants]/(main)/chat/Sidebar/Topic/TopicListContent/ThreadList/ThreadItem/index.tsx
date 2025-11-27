import { Dropdown, Icon } from '@lobehub/ui';
import { TreeDownRightIcon } from '@lobehub/ui/icons';
import { useTheme } from 'antd-style';
import { memo, useCallback } from 'react';

import NavItem from '@/features/NavPanel/NavItem';
import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';

import Actions from './Actions';
import Editing from './Editing';
import { useThreadItemDropdownMenu } from './useDropdownMenu';

export interface ThreadItemProps {
  id: string;
  index: number;
  title: string;
}

const ThreadItem = memo<ThreadItemProps>(({ title, id }) => {
  const theme = useTheme();
  const toggleConfig = useGlobalStore((s) => s.toggleMobileTopic);
  const [toggleThread, editing, activeThreadId] = useChatStore((s) => [
    s.switchThread,
    s.threadRenamingId === id,
    s.activeThreadId,
  ]);

  const toggleEditing = useCallback(
    (visible?: boolean) => {
      useChatStore.setState({ threadRenamingId: visible ? id : '' });
    },
    [id],
  );

  const handleClick = useCallback(() => {
    if (editing) return;
    toggleThread(id);
    toggleConfig(false);
  }, [editing, id, toggleThread, toggleConfig]);

  const dropdownMenu = useThreadItemDropdownMenu({
    id,
    toggleEditing,
  });

  const active = id === activeThreadId;

  return (
    <>
      <Dropdown
        menu={{
          items: dropdownMenu,
        }}
        trigger={['contextMenu']}
      >
        <NavItem
          actions={<Actions dropdownMenu={dropdownMenu} />}
          active={active}
          disabled={editing}
          icon={<Icon color={theme.colorTextDescription} icon={TreeDownRightIcon} size={'small'} />}
          onClick={handleClick}
          title={title}
        />
      </Dropdown>
      <Editing id={id} title={title} toggleEditing={toggleEditing} />
    </>
  );
});

export default ThreadItem;
