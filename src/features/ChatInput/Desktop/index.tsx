'use client';

import { DraggablePanel } from '@lobehub/ui';
import { ReactNode, memo, useCallback, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { CHAT_TEXTAREA_HEIGHT, CHAT_TEXTAREA_MAX_HEIGHT } from '@/const/layoutTokens';

import { ActionKeys } from '../ActionBar/config';
import LocalFiles from './FilePreview';
import Footer from './Footer';
import Head from './Header';

interface DesktopChatInputProps {
  footer?: {
    saveTopic?: boolean;
    shortcutHint?: boolean;
  };
  inputHeight: number;
  leftActions: ActionKeys[];
  onInputHeightChange?: (height: number) => void;
  renderTextArea: (onSend: () => void) => ReactNode;
  rightActions: ActionKeys[];
}

const DesktopChatInput = memo<DesktopChatInputProps>(
  ({ leftActions, rightActions, footer, renderTextArea, inputHeight, onInputHeightChange }) => {
    const [expand, setExpand] = useState<boolean>(false);

    const onSend = useCallback(() => {
      setExpand(false);
    }, []);

    return (
      <>
        {!expand && leftActions.includes('fileUpload') && <LocalFiles />}
        <DraggablePanel
          fullscreen={expand}
          maxHeight={CHAT_TEXTAREA_MAX_HEIGHT}
          minHeight={CHAT_TEXTAREA_HEIGHT}
          onSizeChange={(_, size) => {
            if (!size) return;
            const height =
              typeof size.height === 'string' ? Number.parseInt(size.height) : size.height;
            if (!height) return;

            onInputHeightChange?.(height);
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
            {renderTextArea(onSend)}
            <Footer expand={expand} setExpand={setExpand} {...footer} />
          </Flexbox>
        </DraggablePanel>
      </>
    );
  },
);

DesktopChatInput.displayName = 'DesktopChatInput';

export default DesktopChatInput;
