'use client';

import { memo } from 'react';

import { useChatStore } from '@/store/chat';
import { chatPortalSelectors } from '@/store/chat/selectors';

import { Artifacts, ArtifactsBody } from './Artifacts';
import { FileBody, FilePreview } from './FilePreview';
import { Home, HomeBody } from './Home';

const items = [Artifacts, FilePreview, Home];

export const PortalHeader = memo(() => {
  const enabledList: boolean[] = [];

  for (const item of items) {
    const enabled = item.useEnable();
    enabledList.push(enabled);
  }

  for (const [i, element] of enabledList.entries()) {
    const Header = items[i].Header;
    if (element) {
      return <Header />;
    }
  }

  // const showArtifactUI = useChatStore(chatPortalSelectors.showArtifactUI);
  // const showFilePreview = useChatStore(chatPortalSelectors.showFilePreview);
  //
  // if (showArtifactUI) return <ArtifactsHeader />;
  //
  // if (showFilePreview) return <FileHeader />;
  //
  // return <HomeHeader />;
});

const PortalBody = memo(() => {
  const showArtifactUI = useChatStore(chatPortalSelectors.showArtifactUI);
  const showFilePreview = useChatStore(chatPortalSelectors.showFilePreview);

  if (showArtifactUI) return <ArtifactsBody />;

  if (showFilePreview) return <FileBody />;

  return <HomeBody />;
});

export default PortalBody;
