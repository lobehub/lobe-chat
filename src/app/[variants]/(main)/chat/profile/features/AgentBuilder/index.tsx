import { DraggablePanel } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { memo } from 'react';

import { useAgentStore } from '@/store/agent';
import { builtinAgentSelectors } from '@/store/agent/selectors';

import { useProfileContext } from '../ProfileProvider';
import AgentBuilderConversation from './AgentBuilderConversation';
import AgentBuilderProvider from './AgentBuilderProvider';

const AgentBuilder = memo(() => {
  const theme = useTheme();
  const { chatPanelExpanded, setChatPanelExpanded } = useProfileContext();
  const agentId = useAgentStore((s) => s.activeAgentId);
  const agentBuilderId = useAgentStore(builtinAgentSelectors.agentBuilderId);

  return (
    <DraggablePanel
      backgroundColor={theme.colorBgContainer}
      expand={chatPanelExpanded}
      expandable={false}
      maxWidth={600}
      minWidth={320}
      onExpandChange={setChatPanelExpanded}
      placement="right"
      size={{
        height: '100%',
      }}
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
