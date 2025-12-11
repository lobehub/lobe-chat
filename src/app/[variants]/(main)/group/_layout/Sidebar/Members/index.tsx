'use client';

import { AccordionItem, ActionIcon, Text } from '@lobehub/ui';
import { UserPlus } from 'lucide-react';
import { MouseEvent, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useAgentGroupStore } from '@/store/agentGroup';
import { agentGroupSelectors } from '@/store/agentGroup/selectors';

import GroupMember from '../GroupConfig/GroupMember';

interface MembersProps {
  itemKey: string;
}

const Members = memo<MembersProps>(({ itemKey }) => {
  const { t } = useTranslation('chat');
  const [addModalOpen, setAddModalOpen] = useState(false);

  const activeGroupId = useAgentGroupStore(agentGroupSelectors.activeGroupId);
  const membersCount = useAgentGroupStore(
    agentGroupSelectors.getGroupAgentCount(activeGroupId || ''),
  );

  const handleAddMember = (e: MouseEvent) => {
    e.stopPropagation();
    setAddModalOpen(true);
  };

  return (
    <AccordionItem
      action={
        <ActionIcon
          icon={UserPlus}
          onClick={handleAddMember}
          size={'small'}
          title={t('groupSidebar.members.addMember')}
        />
      }
      itemKey={itemKey}
      paddingBlock={4}
      paddingInline={'8px 4px'}
      title={
        <Text ellipsis fontSize={12} type={'secondary'} weight={500}>
          {`${t('groupSidebar.tabs.members')} ${membersCount + 1}`}
        </Text>
      }
    >
      <Flexbox gap={1} paddingBlock={1}>
        <GroupMember
          addModalOpen={addModalOpen}
          groupId={activeGroupId}
          onAddModalOpenChange={setAddModalOpen}
        />
      </Flexbox>
    </AccordionItem>
  );
});

export default Members;
