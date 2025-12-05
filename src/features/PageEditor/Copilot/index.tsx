'use client';

import { DraggablePanel } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { memo } from 'react';

import { usePageEditorContext } from '../Context';
import Conversation from './Conversation';

const Copilot = memo(() => {
  const { chatPanelExpanded, setChatPanelExpanded } = usePageEditorContext();
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
