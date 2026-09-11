'use client';

import type { SharedAgentData } from '@lobechat/types';
import { Flexbox } from '@lobehub/ui';
import { createStaticStyles } from 'antd-style';
import { memo } from 'react';
import { useNavigate } from 'react-router';

import { buildAgentShareChatPath } from '../visitorPath';
import Band from './Band';
import Metrics from './Metrics';
import Starters from './Starters';
import Terms from './Terms';

const styles = createStaticStyles(({ css }) => ({
  body: css`
    inline-size: 100%;
    max-inline-size: 960px;
    margin-inline: auto;
    padding-block: 8px 64px;
    padding-inline: 24px;
  `,
  scroll: css`
    overflow: hidden auto;
    flex: 1;
    min-block-size: 0;
  `,
}));

interface ProfileProps {
  data: SharedAgentData;
  slugOrId: string;
}

/**
 * Landing surface of an agent share (`/a/:slugOrId`).
 *
 * The old landing surface was the conversation itself, which asked a stranger
 * to type into an empty box before telling them what the agent was for. The
 * profile answers "what is this, what can it reach, how do I start, and what
 * are the terms" first; the composer lives at `/a/:slugOrId/chat`.
 */
const Profile = memo<ProfileProps>(({ data, slugOrId }) => {
  const navigate = useNavigate();

  const openChat = (question?: string) => {
    const path = buildAgentShareChatPath(slugOrId);
    navigate(question ? `${path}?q=${encodeURIComponent(question)}` : path);
  };

  return (
    <div className={styles.scroll}>
      <Band data={data} onStart={() => openChat()} />
      <div className={styles.body}>
        <Metrics data={data} />
        <Flexbox gap={40} paddingBlock={32}>
          <Starters questions={data.agentMeta.openingQuestions} onPick={openChat} />
          <Terms data={data} />
        </Flexbox>
      </div>
    </div>
  );
});

Profile.displayName = 'AgentShareProfile';

export default Profile;
