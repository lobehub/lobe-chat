'use client';

import { memo } from 'react';

import { useChatStore } from '@/store/chat';
import { chatPortalSelectors } from '@/store/chat/selectors';

import Artifacts from './Artifacts';
import FilePreview from './FilePreview';
import Home from './Home';

const PortalView = memo(() => {
  const showArtifactUI = useChatStore(chatPortalSelectors.showArtifactUI);
  const showFilePreview = useChatStore(chatPortalSelectors.showFilePreview);

  if (showArtifactUI) return <Artifacts />;

  if (showFilePreview) return <FilePreview />;

  return <Home />;
});

export default PortalView;
