import { ActionIcon, Dropdown, type MenuProps } from '@lobehub/ui';
import { PlusIcon } from 'lucide-react';
import { memo } from 'react';

interface ActionsProps {
  dropdownMenu: MenuProps['items'];
  isLoading?: boolean;
}

const Actions = memo<ActionsProps>(({ dropdownMenu, isLoading }) => {
  return (
    <Dropdown
      menu={{
        items: dropdownMenu,
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
        },
      }}
      trigger={['click']}
    >
      <ActionIcon icon={PlusIcon} loading={isLoading} size={'small'} style={{ flex: 'none' }} />
    </Dropdown>
  );
});

export default Actions;
