import { ActionIcon, Avatar } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { t } from 'i18next';
import { XIcon } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import SidebarHeader from '@/components/SidebarHeader';
import { DEFAULT_AVATAR } from '@/const/meta';
import { useChatStore } from '@/store/chat';
import { useChatGroupStore } from '@/store/chatGroup';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

const Header = memo(() => {
  const theme = useTheme();
  const togglePortal = useChatStore((s) => s.togglePortal);
  const close = () => {
    useChatGroupStore.setState({ activeThreadAgentId: '' });
    togglePortal(false);
  };
  const activeThreadAgentId = useChatGroupStore((s) => s.activeThreadAgentId);

  const agents = useSessionStore(sessionSelectors.currentGroupAgents);
  const currentAgent = agents?.find((agent) => agent.id === activeThreadAgentId);

  return (
    <SidebarHeader
      actions={
        <Flexbox gap={4} horizontal>
          <ActionIcon icon={XIcon} onClick={close} size={'small'} />
        </Flexbox>
      }
      paddingBlock={6}
      paddingInline={8}
      style={{
        background: `linear-gradient(to bottom, ${theme.colorBgContainerSecondary}, ${theme.colorFillQuaternary})`,
      }}
      title={
        <Flexbox align={'center'} gap={8} horizontal>
          <Avatar
            avatar={currentAgent?.avatar || DEFAULT_AVATAR}
            background={currentAgent?.backgroundColor ?? undefined}
            size={20}
          />
          <div style={{ fontWeight: 600 }}>
            {currentAgent?.title || t('defaultSession', { ns: 'common' })}
          </div>
        </Flexbox>
      }
    />
  );
});

export default Header;
