'use client';

import { DraggablePanel } from '@lobehub/ui';
import { memo } from 'react';

import { usePageEditorContext } from '../Context';
import Conversation from './Conversation';

const Copilot = memo(() => {
  const { chatPanelExpanded, setChatPanelExpanded } = usePageEditorContext();

  return (
    <DraggablePanel
      expand={chatPanelExpanded}
      maxWidth={600}
      minWidth={300}
      onExpandChange={setChatPanelExpanded}
      placement="right"
      size={{ height: '100%' }}
    >
      <Conversation />
    </DraggablePanel>
  );
});

export default Copilot;
