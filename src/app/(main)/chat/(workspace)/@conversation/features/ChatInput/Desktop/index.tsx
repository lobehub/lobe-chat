'use client';

import { DraggablePanel } from '@lobehub/ui';
import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import {
  CHAT_TEXTAREA_HEIGHT,
  CHAT_TEXTAREA_MAX_HEIGHT,
  HEADER_HEIGHT,
} from '@/const/layoutTokens';
import { useFileStore } from '@/store/file';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import Footer from './Footer';
import Head from './Header';
import LocalFiles from './LocalFiles';
import TextArea from './TextArea';

const DesktopChatInput = memo(() => {
  const [expand, setExpand] = useState<boolean>(false);

  const [inputHeight, updatePreference] = useGlobalStore((s) => [
    systemStatusSelectors.inputHeight(s),
    s.updateSystemStatus,
  ]);
  const showFileList = useFileStore((s) => s.inputFilesList.length > 0);

  return (
    <>
      {!expand && <LocalFiles padding={showFileList ? '8px 16px' : 0} />}
      <DraggablePanel
        fullscreen={expand}
        headerHeight={HEADER_HEIGHT}
        maxHeight={CHAT_TEXTAREA_MAX_HEIGHT}
        minHeight={CHAT_TEXTAREA_HEIGHT}
        onSizeChange={(_, size) => {
          if (!size) return;

          updatePreference({
            inputHeight:
              typeof size.height === 'string' ? Number.parseInt(size.height) : size.height,
          });
        }}
        placement="bottom"
        size={{ height: inputHeight, width: '100%' }}
        style={{ zIndex: 10 }}
      >
        <Flexbox
          gap={8}
          height={'100%'}
          padding={'12px 0 16px'}
          style={{ minHeight: CHAT_TEXTAREA_HEIGHT, position: 'relative' }}
        >
          <Head expand={expand} setExpand={setExpand} />
          <TextArea setExpand={setExpand} />
          <Footer expand={expand} setExpand={setExpand} />
        </Flexbox>
      </DraggablePanel>
    </>
  );
});

DesktopChatInput.displayName = 'DesktopChatInput';

export default DesktopChatInput;
