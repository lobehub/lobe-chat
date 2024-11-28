'use client';

import { ActionIcon } from '@lobehub/ui';
import { XIcon } from 'lucide-react';
import { ReactNode, memo } from 'react';

import SidebarHeader from '@/components/SidebarHeader';
import { useChatStore } from '@/store/chat';

const Header = memo<{ title: ReactNode }>(({ title }) => {
  const [toggleInspector] = useChatStore((s) => [s.togglePortal]);

  return (
    <SidebarHeader
      actions={
        <ActionIcon
          icon={XIcon}
          onClick={() => {
            toggleInspector(false);
          }}
        />
      }
      style={{ paddingBlock: 8, paddingInline: 8 }}
      title={title}
    />
  );
});

export default Header;
