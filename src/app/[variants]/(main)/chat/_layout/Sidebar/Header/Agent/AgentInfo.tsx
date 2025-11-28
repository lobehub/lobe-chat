'use client';

import { ActionIcon, Avatar, Block, Text } from '@lobehub/ui';
import { ChevronsUpDownIcon } from 'lucide-react';
import React, { PropsWithChildren, memo } from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_AVATAR } from '@/const/meta';
import { SkeletonItem } from '@/features/NavPanel/Body/SkeletonList';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';

import SwitchPanel from './SwitchPanel';

const Agent = memo<PropsWithChildren>(() => {
  const { t } = useTranslation(['chat', 'common']);

  const [isLoading, isInbox, title, avatar, backgroundColor] = useAgentStore((s) => [
    agentSelectors.isAgentConfigLoading(s),
    agentSelectors.isInboxAgent(s),
    agentSelectors.currentAgentTitle(s),
    agentSelectors.currentAgentAvatar(s),
    agentSelectors.currentAgentBackgroundColor(s),
  ]);

  const displayTitle = isInbox ? t('inbox.title') : title || t('defaultSession', { ns: 'common' });

  if (isLoading) return <SkeletonItem />;

  return (
    <SwitchPanel>
      <Block
        align={'center'}
        clickable
        gap={8}
        horizontal
        paddingBlock={2}
        style={{
          minWidth: 32,
          overflow: 'hidden',
          paddingInlineEnd: 8,
          paddingInlineStart: 2,
        }}
        variant={'borderless'}
      >
        <Avatar
          avatar={avatar || DEFAULT_AVATAR}
          background={backgroundColor || undefined}
          shape={'square'}
          size={28}
        />
        <Text ellipsis weight={500}>
          {displayTitle}
        </Text>
        <ActionIcon
          icon={ChevronsUpDownIcon}
          size={{
            blockSize: 32,
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
