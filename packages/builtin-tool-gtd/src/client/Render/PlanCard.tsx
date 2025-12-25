'use client';

import { Block, Flexbox, Icon, Text } from '@lobehub/ui';
import { ListChecksIcon } from 'lucide-react';
import { memo } from 'react';

import { useChatStore } from '@/store/chat';

import type { Plan } from '../../types';

interface PlanCardProps {
  plan: Plan;
}

const PlanCard = memo<PlanCardProps>(({ plan }) => {
  const openDocument = useChatStore((s) => s.openDocument);

  const handleClick = () => {
    openDocument(plan.id);
  };

  return (
    <Block
      clickable
      gap={8}
      onClick={handleClick}
      padding={12}
      style={{ overflow: 'hidden' }}
      variant={'outlined'}
    >
      <Flexbox align={'center'} gap={8} horizontal style={{ overflow: 'hidden' }}>
        <Icon icon={ListChecksIcon} size={18} />
        <Text ellipsis fontSize={16} weight={500}>
          {plan.goal}
        </Text>
      </Flexbox>
      {plan.description && (
        <Text ellipsis={{ rows: 2 }} fontSize={14} type={'secondary'}>
          {plan.description}
        </Text>
      )}
    </Block>
  );
});

export default PlanCard;
