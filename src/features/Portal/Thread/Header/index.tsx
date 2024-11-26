import { ActionIcon } from '@lobehub/ui';
import { XIcon } from 'lucide-react';

import SidebarHeader from '@/components/SidebarHeader';
import { useChatStore } from '@/store/chat';

import Title from './Title';

const Header = () => {
  const closeThreadPortal = useChatStore((s) => s.closeThreadPortal);
  return (
    <SidebarHeader
      actions={<ActionIcon icon={XIcon} onClick={closeThreadPortal} />}
      style={{ paddingBlock: 8, paddingInline: 8 }}
      title={<Title />}
    />
  );
};

export default Header;
