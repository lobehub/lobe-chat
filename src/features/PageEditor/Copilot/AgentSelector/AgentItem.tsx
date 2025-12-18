import { GroupMemberAvatar } from '@lobechat/types';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import AgentAvatar from '@/app/[variants]/(main)/home/_layout/Body/Agent/List/AgentItem/Avatar';
import NavItem from '@/features/NavPanel/components/NavItem';

import Actions from './Actions';
import { useDropdownMenu } from './useDropdownMenu';

interface AgentItemProps {
  active: boolean;
  agentId: string;
  agentTitle: string;
  avatar: string | GroupMemberAvatar[] | null | undefined;
  isBuiltinAgent: boolean;
  onAgentChange: (agentId: string) => void;
  onClose: () => void;
}

const AgentItem = memo<AgentItemProps>(
  ({ active, agentId, agentTitle, avatar, isBuiltinAgent, onAgentChange, onClose }) => {
    const { t } = useTranslation('chat');

    const dropdownMenu = useDropdownMenu({
      agentId,
      agentTitle,
      isBuiltinAgent,
      onClose,
    });

    return (
      <NavItem
        actions={<Actions dropdownMenu={dropdownMenu} />}
        active={active}
        icon={<AgentAvatar avatar={typeof avatar === 'string' ? avatar : undefined} />}
        onClick={() => {
          onAgentChange(agentId);
          onClose();
        }}
        style={{ flexShrink: 0 }}
        title={agentTitle || t('untitledAgent')}
      />
    );
  },
);

export default AgentItem;
