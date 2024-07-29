'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { chatPortalSelectors } from '@/store/chat/selectors';

import ToolUI from './features/ArtifactUI';
import Artifacts from './features/Artifacts';

const PortalView = memo(() => {
  const showToolUI = useChatStore(chatPortalSelectors.showArtifactUI);

  if (showToolUI) return <ToolUI />;

  return (
    <Flexbox height={'100%'}>
      <Artifacts />
    </Flexbox>
  );
});

export default PortalView;
