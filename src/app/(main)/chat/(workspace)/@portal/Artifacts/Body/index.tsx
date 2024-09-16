import { Highlighter } from '@lobehub/ui';
import { Segmented } from 'antd';
import isEqual from 'fast-deep-equal';
import { useMemo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { chatPortalSelectors, chatSelectors } from '@/store/chat/selectors';

import HTMLRender from './HTMLRender';

const ArtifactsUI = () => {
  const [artifactType, artifactContent] = useChatStore((s) => [
    chatPortalSelectors.artifactType(s),
    chatPortalSelectors.artifactContent(s),
  ]);
  const messageId = useChatStore(chatPortalSelectors.artifactMessageId);
  const message = useChatStore(chatSelectors.getMessageById(messageId || ''), isEqual);

  const [value, setValue] = useState('code');
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
      <Segmented
        block
        onChange={setValue}
        options={[
          { label: 'Code', value: 'code' },
          { label: 'Preview', value: 'preview' },
        ]}
        value={value}
      />
      {value === 'code' ? (
        <Highlighter language={language} style={{ maxHeight: '100%', overflow: 'hidden' }} wrap>
          {artifactContent!}
        </Highlighter>
      ) : (
        <HTMLRender htmlContent={artifactContent!} />
      )}
    </Flexbox>
  );
};

export default ArtifactsUI;
