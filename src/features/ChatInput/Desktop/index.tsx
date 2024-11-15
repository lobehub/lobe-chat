'use client';

import { DraggablePanel } from '@lobehub/ui';
import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { CHAT_TEXTAREA_HEIGHT, CHAT_TEXTAREA_MAX_HEIGHT } from '@/const/layoutTokens';
import { ActionKeys } from '@/features/ChatInput/ActionBar/config';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import LocalFiles from './FilePreview';
import Footer from './Footer';
import Head from './Header';
import TextArea from './TextArea';

const defaultLeftActions = [
  'model',
  'fileUpload',
  'knowledgeBase',
  'temperature',
  'history',
  'stt',
  'tools',
  'token',
] as ActionKeys[];

const defaultRightActions = ['clear'] as ActionKeys[];

interface DesktopChatInputProps {
  leftActions?: ActionKeys[];
  rightActions?: ActionKeys[];
}
const DesktopChatInput = memo<DesktopChatInputProps>(
  ({ leftActions = defaultLeftActions, rightActions = defaultRightActions }) => {
    const [expand, setExpand] = useState<boolean>(false);

    const [inputHeight, updatePreference] = useGlobalStore((s) => [
      systemStatusSelectors.inputHeight(s),
      s.updateSystemStatus,
    ]);

    return (
      <>
        {!expand && <LocalFiles />}
        <DraggablePanel
          fullscreen={expand}
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
            <Head
              expand={expand}
              leftActions={leftActions}
              rightActions={rightActions}
              setExpand={setExpand}
            />
            <TextArea setExpand={setExpand} />
            <Footer expand={expand} setExpand={setExpand} />
          </Flexbox>
        </DraggablePanel>
      </>
    );
  },
);

DesktopChatInput.displayName = 'DesktopChatInput';

export default DesktopChatInput;
