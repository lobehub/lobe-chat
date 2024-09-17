import { Highlighter } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { chatPortalSelectors, chatSelectors } from '@/store/chat/selectors';

import HTMLRender from './HTMLRender';

const ArtifactsUI = () => {
  const [displayMode, artifactType, artifactContent] = useChatStore((s) => [
    s.portalArtifactDisplayMode,

    chatPortalSelectors.artifactType(s),
    chatPortalSelectors.artifactContent(s),
  ]);
  const messageId = useChatStore(chatPortalSelectors.artifactMessageId);
  const message = useChatStore(chatSelectors.getMessageById(messageId || ''), isEqual);

  const language = useMemo(() => {
    switch (artifactType) {
      case 'react': {
        return 'tsx';
      }

      case 'python': {
        return 'html';
      }

      default: {
        return 'html';
      }
    }
  }, [artifactType]);

  // make sure the message and id is valid
  if (!messageId || !message) return;
  return (
    <Flexbox
      className={'portal-artifact'}
      flex={1}
      gap={8}
      height={'100%'}
      paddingInline={12}
      style={{ overflow: 'hidden' }}
    >
      {displayMode === 'preview' ? (
        <HTMLRender htmlContent={artifactContent!} />
      ) : (
        <Highlighter language={language} style={{ maxHeight: '100%', overflow: 'hidden' }} wrap>
          {artifactContent!}
        </Highlighter>
      )}
    </Flexbox>
  );
};

export default ArtifactsUI;
