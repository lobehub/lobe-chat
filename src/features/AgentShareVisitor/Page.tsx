'use client';

import { DEFAULT_AVATAR } from '@lobechat/const';
import type { SharedAgentData } from '@lobechat/types';
import { agentDisplayName } from '@lobechat/types';
import { Flexbox } from '@lobehub/ui';
import { ActionIcon, Avatar, Drawer, Text } from '@lobehub/ui/base-ui';
import { cssVar } from 'antd-style';
import { PanelLeftOpen } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';

import { useIsMobile } from '@/hooks/useIsMobile';

import ShareGate from './ShareGate';
import { isShareInteractive } from './shareInteractivity';
import TopicPanel from './TopicPanel';
import VisitorConversation from './VisitorConversation';

const SIDEBAR_WIDTH = 260;

/**
 * Starter prompt handed over by the profile's opening questions. A draft, not
 * a send: arriving with a message already dispatched would spend the
 * creator's budget without the visitor agreeing to it.
 */
const STARTER_PROMPT_PARAM = 'q';

const ShareConversation = memo<{ data: SharedAgentData }>(({ data }) => {
  const { t } = useTranslation('agent');
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchParams] = useSearchParams();

  const interactive = isShareInteractive(data.visibility);
  const initialPrompt = searchParams.get(STARTER_PROMPT_PARAM) ?? undefined;

  return (
    <>
      {!isMobile && (
        <Flexbox
          style={{ borderInlineEnd: `1px solid ${cssVar.colorBorderSecondary}` }}
          width={SIDEBAR_WIDTH}
        >
          <TopicPanel enabled={interactive} shareId={data.shareId} />
        </Flexbox>
      )}
      <Flexbox flex={1} style={{ overflow: 'hidden' }}>
        <Flexbox
          horizontal
          align={'center'}
          gap={8}
          padding={12}
          style={{ borderBlockEnd: `1px solid ${cssVar.colorBorderSecondary}` }}
        >
          {isMobile && (
            <ActionIcon
              icon={PanelLeftOpen}
              title={t('share.visitor.topics.title')}
              onClick={() => setDrawerOpen(true)}
            />
          )}
          <Avatar
            // Same fallback the conversation's welcome block uses, so an agent
            // without a custom avatar does not degrade to "UN" initials here.
            avatar={data.agentMeta.avatar ?? DEFAULT_AVATAR}
            background={data.agentMeta.backgroundColor ?? undefined}
            size={28}
          />
          <Flexbox flex={1} style={{ overflow: 'hidden' }}>
            <Text ellipsis weight={500}>
              {agentDisplayName(data.agentMeta)}
            </Text>
            {data.agentMeta.description && (
              <Text ellipsis fontSize={12} type={'secondary'}>
                {data.agentMeta.description}
              </Text>
            )}
          </Flexbox>
        </Flexbox>
        {/* Always shown, never dismissible: the visitor is chatting inside the
            creator's account, so "the creator may be able to read this" is a
            standing fact about the surface, not a one-time tip. */}
        <Flexbox
          paddingBlock={6}
          paddingInline={12}
          style={{ background: cssVar.colorFillQuaternary }}
        >
          <Text fontSize={12} type={'secondary'}>
            {t('share.visitor.privacyNotice')}
          </Text>
        </Flexbox>
        <VisitorConversation data={data} initialPrompt={initialPrompt} />
      </Flexbox>
      {isMobile && (
        <Drawer
          open={drawerOpen}
          placement={'left'}
          title={t('share.visitor.topics.title')}
          width={280}
          onClose={() => setDrawerOpen(false)}
        >
          {/* The Drawer already renders the title bar — skip the panel's own. */}
          <TopicPanel
            enabled={interactive}
            shareId={data.shareId}
            showTitle={false}
            onSelect={() => setDrawerOpen(false)}
          />
        </Drawer>
      )}
    </>
  );
});

ShareConversation.displayName = 'AgentShareConversation';

/**
 * Conversation surface of an agent share (`/a/:slugOrId/chat/:topicId?`): the
 * product bar on top, topic list on the left (a drawer on mobile), the shared
 * agent's conversation on the right. Deliberately a trimmed shell — no agent
 * switcher, task list, working sidebar, terminal, or model picker.
 *
 * The share's landing surface is the profile one segment up; this page is
 * reached by starting or resuming a conversation from there.
 */
const AgentShareVisitorPage = memo(() => (
  <ShareGate horizontal>{(data) => <ShareConversation data={data} />}</ShareGate>
));

AgentShareVisitorPage.displayName = 'AgentShareVisitorPage';

export default AgentShareVisitorPage;
