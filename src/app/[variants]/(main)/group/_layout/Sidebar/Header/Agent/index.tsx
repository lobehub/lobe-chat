'use client';

import { ActionIcon, Block, GroupAvatar, Text } from '@lobehub/ui';
import { ChevronsUpDownIcon } from 'lucide-react';
import React, { PropsWithChildren, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_AVATAR } from '@/const/meta';
import { SkeletonItem } from '@/features/NavPanel/components/SkeletonList';
import { useAgentGroupStore } from '@/store/agentGroup';
import { agentGroupSelectors } from '@/store/agentGroup/selectors';

import SwitchPanel from './SwitchPanel';

const Agent = memo<PropsWithChildren>(() => {
  const { t } = useTranslation(['chat', 'common']);

  const [isGroupsInit, groupMeta, agents] = useAgentGroupStore((s) => [
    agentGroupSelectors.isGroupsInit(s),
    agentGroupSelectors.currentGroupMeta(s),
    agentGroupSelectors.currentGroupAgents(s),
  ]);

  const displayTitle = groupMeta?.title || t('untitledGroup', { ns: 'chat' });

  if (isGroupsInit) return <SkeletonItem height={32} padding={0} />;

  return (
    <SwitchPanel>
      <Block
        align={'center'}
        clickable
        gap={8}
        horizontal
        padding={2}
        style={{
          minWidth: 32,
          overflow: 'hidden',
        }}
        variant={'borderless'}
      >
        <GroupAvatar
          avatarShape={'square'}
          avatars={agents.map((agent) => ({
            avatar: agent.avatar || DEFAULT_AVATAR,
            background: agent.backgroundColor || undefined,
            style: { borderRadius: 3 },
          }))}
          cornerShape={'square'}
          size={28}
          title={groupMeta?.title || undefined}
        />
        <Text ellipsis weight={500}>
          {displayTitle}
        </Text>
        <ActionIcon
          icon={ChevronsUpDownIcon}
          size={{
            blockSize: 28,
            size: 16,
          }}
          style={{
            width: 24,
          }}
        />
      </Block>
    </SwitchPanel>
  );
});

export default Agent;
