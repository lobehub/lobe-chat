import { ActionIcon, Dropdown } from '@lobehub/ui';
import { MoreHorizontalIcon } from 'lucide-react';
import { memo } from 'react';

import { useFileItemDropdown } from '../useFileItemDropdown';

interface DropdownMenuProps {
  fileType: string;
  filename: string;
  id: string;
  knowledgeBaseId?: string;
  onRenameStart?: () => void;
  sourceType?: string;
  url: string;
}

const DropdownMenu = memo<DropdownMenuProps>(
  ({ id, knowledgeBaseId, url, filename, fileType, sourceType, onRenameStart }) => {
    const { menuItems, moveModal } = useFileItemDropdown({
      fileType,
      filename,
      id,
      knowledgeBaseId,
      onRenameStart,
      sourceType,
      url,
    });

    return (
      <>
        <Dropdown menu={{ items: menuItems }}>
          <ActionIcon icon={MoreHorizontalIcon} size={'small'} />
        </Dropdown>
        {moveModal}
      </>
    );
  },
);

export default DropdownMenu;
