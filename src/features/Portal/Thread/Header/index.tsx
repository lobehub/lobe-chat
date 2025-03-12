import { ActionIcon } from '@lobehub/ui';
import { ArrowLeftRight, XIcon } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import SidebarHeader from '@/components/SidebarHeader';
import { useChatStore } from '@/store/chat';

import Title from './Title';

const Header = memo(() => {
  const [hasPortal, portalThreadId, closeThreadPortal, switchThread] = useChatStore((s) => [
    !!s.portalThreadId,
    s.portalThreadId,
    s.closeThreadPortal,
    s.switchThread,
  ]);

  return (
    <SidebarHeader
      actions={
        <Flexbox horizontal>
          {hasPortal && (
            <ActionIcon
              icon={ArrowLeftRight}
              onClick={() => {
                if (!portalThreadId) return;

                switchThread(portalThreadId);
                closeThreadPortal();
              }}
            />
          )}
          <ActionIcon icon={XIcon} onClick={closeThreadPortal} />
        </Flexbox>
      }
      style={{ paddingBlock: 8, paddingInline: 8 }}
      title={<Title />}
    />
  );
});

export default Header;
