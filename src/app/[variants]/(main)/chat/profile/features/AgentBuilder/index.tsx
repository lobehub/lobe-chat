import { DraggablePanel } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { memo, useState } from 'react';

import Loading from '@/components/Loading/BrandTextLoading';
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
  const [width, setWidth] = useState<string | number>(360);

  return (
    <DraggablePanel
      backgroundColor={theme.colorBgContainer}
      expand={chatPanelExpanded}
      expandable={false}
      maxWidth={600}
      minWidth={360}
      onExpandChange={setChatPanelExpanded}
      onSizeChange={(_, size) => {
        if (size?.width) {
          setWidth(size.width);
        }
      }}
      placement="right"
      size={{
        height: '100%',
        width,
      }}
    >
      {agentId && agentBuilderId ? (
        <AgentBuilderProvider agentId={agentBuilderId}>
          <AgentBuilderConversation agentId={agentBuilderId} />
        </AgentBuilderProvider>
      ) : (
        <Loading debugId="AgentBuilder > Init" />
      )}
    </DraggablePanel>
  );
});

export default AgentBuilder;
