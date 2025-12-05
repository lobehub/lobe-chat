import { DraggablePanel } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { memo } from 'react';

import { useAgentStore } from '@/store/agent';
import { builtinAgentSelectors } from '@/store/agent/selectors';

import { useProfileStore } from '../store';
import AgentBuilderConversation from './AgentBuilderConversation';
import AgentBuilderProvider from './AgentBuilderProvider';

const AgentBuilder = memo(() => {
  const theme = useTheme();
  const chatPanelExpanded = useProfileStore((s) => s.chatPanelExpanded);
  const setChatPanelExpanded = useProfileStore((s) => s.setChatPanelExpanded);
  const agentId = useAgentStore((s) => s.activeAgentId);
  const agentBuilderId = useAgentStore(builtinAgentSelectors.agentBuilderId);

  return (
    <DraggablePanel
      backgroundColor={theme.colorBgContainer}
      defaultSize={{
        height: '100%',
      }}
      expand={chatPanelExpanded}
      expandable={false}
      maxWidth={600}
      minWidth={360}
      onExpandChange={setChatPanelExpanded}
      placement="right"
    >
      {agentId && agentBuilderId && (
        <AgentBuilderProvider agentId={agentBuilderId}>
          <AgentBuilderConversation agentId={agentBuilderId} />
        </AgentBuilderProvider>
      )}
    </DraggablePanel>
  );
});

export default AgentBuilder;
