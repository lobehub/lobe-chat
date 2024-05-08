import { ActionIcon } from '@lobehub/ui';
import { Dropdown } from 'antd';
import { MoreVertical } from 'lucide-react';
import { memo } from 'react';

import { ActionProps, useDropdownItems } from './useDropdownItems';

const Actions = memo<ActionProps>(({ group, id, openCreateGroupModal, setOpen }) => {
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
      trigger={['click']}
    >
      <ActionIcon
        icon={MoreVertical}
        size={{
          blockSize: 28,
          fontSize: 16,
        }}
      />
    </Dropdown>
  );
});

export default Actions;
