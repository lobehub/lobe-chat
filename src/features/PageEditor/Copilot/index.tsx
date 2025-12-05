'use client';

import { DraggablePanel } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { memo } from 'react';

import { usePageEditorStore } from '../store';
import Conversation from './Conversation';

const Copilot = memo(() => {
  const chatPanelExpanded = usePageEditorStore((s) => s.chatPanelExpanded);
  const setChatPanelExpanded = usePageEditorStore((s) => s.setChatPanelExpanded);
  const theme = useTheme();
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
      <Conversation />
    </DraggablePanel>
  );
});

export default Copilot;
