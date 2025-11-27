import { ActionIcon, Dropdown } from '@lobehub/ui';
import { MoreHorizontal, Search } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import TopicSearchBar from './TopicSearchBar';
import { useTopicActionsDropdownMenu } from './useDropdownMenu';

interface ActionsProps {
  onClear: () => void;
  onSearch: () => void;
  showSearch: boolean;
}

const Actions = memo<ActionsProps>(({ onClear, onSearch, showSearch }) => {
  const dropdownMenu = useTopicActionsDropdownMenu();

  if (showSearch) {
    return (
      <Flexbox style={{ flex: 1, minWidth: 0 }}>
        <TopicSearchBar onClear={onClear} />
      </Flexbox>
    );
  }

  return (
    <>
      <ActionIcon icon={Search} onClick={onSearch} size={'small'} />
      <Dropdown
        arrow={false}
        menu={{
          items: dropdownMenu,
          onClick: ({ domEvent }) => {
            domEvent.stopPropagation();
          },
        }}
        trigger={['click']}
      >
        <ActionIcon icon={MoreHorizontal} size={'small'} />
      </Dropdown>
    </>
  );
});

export default Actions;
