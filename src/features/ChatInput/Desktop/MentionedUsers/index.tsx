import { createStyles } from 'antd-style';
import { lighten } from 'polished';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useMentionStore } from '@/store/mention';
import { mentionSelectors } from '@/store/mention/selectors';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

import MentionedUserItem from './MentionedUserItem';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    overflow-x: scroll;

    width: 100%;
    border-start-start-radius: 8px;
    border-start-end-radius: 8px;

    background: ${lighten(0.01, token.colorBgLayout)};
  `,
}));

const MentionedUsers = memo(() => {
  const { styles } = useStyles();

  const currentSession = useSessionStore(sessionSelectors.currentSession);
  const mentionedUsers = useMentionStore(mentionSelectors.mentionedUsers);
  const hasMentionedUsers = useMentionStore(mentionSelectors.hasMentionedUsers);

  if (currentSession?.type !== 'group' || !hasMentionedUsers) return null;

  const mentionedAgents = currentSession.members?.filter(
    (agent) => agent.id && mentionedUsers.includes(agent.id),
  );

  if (mentionedAgents?.length === 0) return null;

  return (
    <Flexbox
      className={styles.container}
      gap={6}
      horizontal
      padding={hasMentionedUsers ? '16px 16px 12px' : 0}
    >
      {mentionedAgents?.map((agent) => (
        <MentionedUserItem agent={agent} key={agent.id} />
      ))}
    </Flexbox>
  );
});

export default MentionedUsers;
