import { Highlighter } from '@lobehub/ui';
import { memo, useEffect, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { chatPortalSelectors, chatSelectors } from '@/store/chat/selectors';

import Renderer from './Renderer';

const ArtifactsUI = memo(() => {
  const [
    messageId,
    displayMode,
    isMessageGenerating,
    artifactType,
    artifactContent,

    isArtifactTagClosed,
  ] = useChatStore((s) => {
    const messageId = chatPortalSelectors.artifactMessageId(s) || '';

    return [
      messageId,
      s.portalArtifactDisplayMode,
      chatSelectors.isMessageGenerating(messageId)(s),
      chatPortalSelectors.artifactType(s),
      chatPortalSelectors.artifactCode(messageId)(s),
      chatPortalSelectors.isArtifactTagClosed(messageId)(s),
    ];
  });

  useEffect(() => {
    // when message generating , check whether the artifact is closed
    // if close, move the display mode to preview
    if (isMessageGenerating && isArtifactTagClosed && displayMode === 'code') {
      useChatStore.setState({ portalArtifactDisplayMode: 'preview' });
    }
  }, [isMessageGenerating, displayMode, isArtifactTagClosed]);

  const language = useMemo(() => {
    switch (artifactType) {
      case 'application/lobe.artifacts.react': {
        return 'tsx';
      }

      case 'python': {
        return 'python';
      }

      default: {
        return 'html';
      }
    }
  }, [artifactType]);

  // make sure the message and id is valid
  if (!messageId) return;

  return (
    <Flexbox
      className={'portal-artifact'}
      flex={1}
      gap={8}
      height={'100%'}
      paddingInline={12}
      style={{ overflow: 'hidden' }}
    >
      {!isArtifactTagClosed || displayMode === 'code' ? (
        <Highlighter language={language} style={{ maxHeight: '100%', overflow: 'hidden' }}>
          {artifactContent}
        </Highlighter>
      ) : (
        <Renderer content={artifactContent} type={artifactType} />
      )}
    </Flexbox>
  );
});

export default ArtifactsUI;
