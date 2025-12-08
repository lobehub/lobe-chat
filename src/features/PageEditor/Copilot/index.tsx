'use client';

import { DraggablePanel } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { Suspense, memo, useState } from 'react';

import CircleLoading from '@/components/Loading/CircleLoading';
import { useAgentStore } from '@/store/agent';
import { builtinAgentSelectors } from '@/store/agent/selectors';

import { usePageEditorStore } from '../store';
import Conversation from './Conversation';

/**
 * Help write, read, and edit the page
 */
const Copilot = memo(() => {
  const chatPanelExpanded = usePageEditorStore((s) => s.chatPanelExpanded);
  const setChatPanelExpanded = usePageEditorStore((s) => s.setChatPanelExpanded);
  const theme = useTheme();
  const [width, setWidth] = useState<string | number>(360);

  const pageAgentId = useAgentStore(builtinAgentSelectors.pageAgentId);

  return (
    <DraggablePanel
      backgroundColor={theme.colorBgContainer}
      defaultExpand={true}
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
      <Suspense fallback={<CircleLoading />}>
        <Conversation agentId={pageAgentId} />
      </Suspense>
    </DraggablePanel>
  );
});

export default Copilot;
