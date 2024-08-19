'use client';

import { memo } from 'react';

import { useChatStore } from '@/store/chat';
import { chatPortalSelectors } from '@/store/chat/selectors';

import Artifacts from './Artifacts';
import Home from './Home';

const PortalView = memo(() => {
  const showArtifactUI = useChatStore(chatPortalSelectors.showArtifactUI);

  if (showArtifactUI) return <Artifacts />;

  return <Home />;
});

export default PortalView;
