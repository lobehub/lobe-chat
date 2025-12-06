'use client';

import { DraggablePanel } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { memo, useState } from 'react';

import { usePageEditorStore } from '../store';
import Conversation from './Conversation';

const Copilot = memo(() => {
  const chatPanelExpanded = usePageEditorStore((s) => s.chatPanelExpanded);
  const setChatPanelExpanded = usePageEditorStore((s) => s.setChatPanelExpanded);
  const theme = useTheme();
  const [width, setWidth] = useState<string | number>(360);
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
      <Conversation />
    </DraggablePanel>
  );
});

export default Copilot;
