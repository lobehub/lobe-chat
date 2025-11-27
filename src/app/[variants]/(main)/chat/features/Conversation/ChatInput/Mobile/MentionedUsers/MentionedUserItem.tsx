import { Avatar, Text } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useMentionStore } from '@/store/mention';

interface MentionedUserItemProps {
  agent: any; // The actual agent data from the group
}

const MentionedUserItem = memo<MentionedUserItemProps>(({ agent }) => {
  const removeMentionedUser = useMentionStore((s: any) => s.removeMentionedUser);

  const handleRemove = () => {
    removeMentionedUser(agent.id);
  };

  return (
    <Flexbox
      align={'center'}
      gap={8}
      horizontal
      style={{
        background: 'rgba(0, 0, 0, 0.04)',
        borderRadius: 16,
        padding: '8px 12px',
        position: 'relative',
      }}
    >
      <Avatar avatar={agent.avatar} background={agent.backgroundColor} shape="circle" size={24} />
      <Text ellipsis={{ tooltip: true }} style={{ fontSize: 12, maxWidth: 80 }}>
        {agent.title || agent.id}
      </Text>
      <div
        onClick={handleRemove}
        style={{
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.1)',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          height: 16,
          justifyContent: 'center',
          padding: 2,
          width: 16,
        }}
      >
        <Text style={{ fontSize: 10, lineHeight: 1 }}>×</Text>
      </div>
    </Flexbox>
  );
});

export default MentionedUserItem;
