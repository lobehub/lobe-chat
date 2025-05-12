import { ActionIcon } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { ArrowLeftRight, XIcon } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import SidebarHeader from '@/components/SidebarHeader';
import { useChatStore } from '@/store/chat';

import Title from './Title';

const Header = memo(() => {
  const theme = useTheme();
  const [hasPortal, portalThreadId, closeThreadPortal, switchThread] = useChatStore((s) => [
    !!s.portalThreadId,
    s.portalThreadId,
    s.closeThreadPortal,
    s.switchThread,
  ]);

  return (
    <SidebarHeader
      actions={
        <Flexbox gap={4} horizontal>
          {hasPortal && (
            <ActionIcon
              icon={ArrowLeftRight}
              onClick={() => {
                if (!portalThreadId) return;

                switchThread(portalThreadId);
                closeThreadPortal();
              }}
              size={'small'}
            />
          )}
          <ActionIcon icon={XIcon} onClick={closeThreadPortal} size={'small'} />
        </Flexbox>
      }
      paddingBlock={6}
      paddingInline={8}
      style={{
        background: `linear-gradient(to bottom, ${theme.colorBgContainerSecondary}, ${theme.colorFillQuaternary})`,
      }}
      title={<Title />}
    />
  );
});

export default Header;
