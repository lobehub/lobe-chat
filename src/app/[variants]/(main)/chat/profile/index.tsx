'use client';

import { AGENT_BUILDER } from '@lobechat/const';
import { DraggablePanel } from '@lobehub/ui';
import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import WideScreenContainer from '@/features/Conversation/components/WideScreenContainer';
import { useAgentStore } from '@/store/agent';
import { builtinAgentSelectors } from '@/store/agent/selectors';

import AgentBuilderConversation from './features/AgentBuilderConversation';
import AgentBuilderProvider from './features/AgentBuilderProvider';
import Header from './features/Header';
import ProfileEditor from './features/ProfileEditor';
import ProfileProvider from './features/ProfileProvider';

const AgentProfile = memo(() => {
  const [chatPanelExpanded, setChatPanelExpanded] = useState(true);
  const agentId = useAgentStore((s) => s.activeAgentId);

  // Initialize agent builder builtin agent
  const useInitBuiltinAgent = useAgentStore((s) => s.useInitBuiltinAgent);
  const agentBuilderId = useAgentStore(builtinAgentSelectors.agentBuilderId);
  useInitBuiltinAgent(AGENT_BUILDER.slug);

  return (
    <ProfileProvider>
      <Flexbox height={'100%'} horizontal>
        <Flexbox flex={1} height={'100%'}>
          <Header onToggleAgentBuilder={() => setChatPanelExpanded((prev) => !prev)} />
          <Flexbox
            height={'100%'}
            horizontal
            style={{ display: 'flex', overflowY: 'auto', position: 'relative' }}
            width={'100%'}
          >
            <WideScreenContainer>
              <ProfileEditor />
            </WideScreenContainer>
          </Flexbox>
        </Flexbox>

        {agentId && agentBuilderId && (
          <AgentBuilderProvider agentId={agentId}>
            <DraggablePanel
              expand={chatPanelExpanded}
              maxWidth={600}
              minWidth={300}
              onExpandChange={setChatPanelExpanded}
              placement="right"
            >
              <AgentBuilderConversation />
            </DraggablePanel>
          </AgentBuilderProvider>
        )}
      </Flexbox>
    </ProfileProvider>
  );
});

export default AgentProfile;
