import { ListItemProps } from '@lobehub/ui';
import { Dropdown } from 'antd';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { ActionProps, useDropdownItems } from '../List/Item/useDropdownItems';
import RawListItem from './item';

const ListItem = memo<ActionProps & ListItemProps & { avatar: string; avatarBackground?: string }>(
  ({ group, id, openCreateGroupModal, setOpen, ...props }) => {
    const items = useDropdownItems(id, group, openCreateGroupModal);

    return (
      <Dropdown
        arrow={false}
        menu={{
          items,
          onClick: ({ domEvent }) => {
            domEvent.stopPropagation();
          },
        }}
        onOpenChange={setOpen}
        trigger={['contextMenu']}
      >
        <Flexbox>
          <RawListItem {...(props as any)} />
        </Flexbox>
      </Dropdown>
    );
  },
);
export default ListItem;
