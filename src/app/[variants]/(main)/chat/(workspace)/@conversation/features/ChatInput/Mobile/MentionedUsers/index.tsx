import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useMentionStore } from '@/store/mention';
import { mentionSelectors } from '@/store/mention/selectors';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

import MentionedUserItem from './MentionedUserItem';

const MentionedUsers = memo(() => {
  const currentSession = useSessionStore(sessionSelectors.currentSession);
  const mentionedUsers = useMentionStore(mentionSelectors.mentionedUsers);
  const hasMentionedUsers = useMentionStore(mentionSelectors.hasMentionedUsers);

  const groupMembers = useSessionStore(sessionSelectors.currentGroupAgents);

  const mentionedAgents = (groupMembers || []).filter((member) =>
    mentionedUsers.includes(member.id || ''),
  );

  if (currentSession?.type !== 'group' || !hasMentionedUsers || mentionedAgents.length === 0)
    return null;

  return (
    <Flexbox paddingBlock={4} style={{ position: 'relative' }}>
      <Flexbox
        gap={4}
        horizontal
        padding={'4px 8px 8px'}
        style={{ overflow: 'scroll', width: '100%' }}
      >
        {mentionedAgents.map((member) => (
          <MentionedUserItem agent={member} key={member.id} />
        ))}
      </Flexbox>
    </Flexbox>
  );
});

export default MentionedUsers;
