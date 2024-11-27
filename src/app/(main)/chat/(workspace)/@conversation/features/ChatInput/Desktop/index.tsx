'use client';

import { memo } from 'react';

import { ActionKeys } from '@/features/ChatInput/ActionBar/config';
import DesktopChatInput, { FooterRender } from '@/features/ChatInput/Desktop';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import Footer from './Footer';
import TextArea from './TextArea';

const leftActions = [
  'model',
  'fileUpload',
  'knowledgeBase',
  'temperature',
  'history',
  'stt',
  'tools',
  'mainToken',
] as ActionKeys[];

const rightActions = ['clear'] as ActionKeys[];

const renderTextArea = (onSend: () => void) => <TextArea onSend={onSend} />;
const renderFooter: FooterRender = ({ expand, onExpandChange }) => (
  <Footer expand={expand} onExpandChange={onExpandChange} />
);

const Desktop = memo(() => {
  const [inputHeight, updatePreference] = useGlobalStore((s) => [
    systemStatusSelectors.inputHeight(s),
    s.updateSystemStatus,
  ]);

  return (
    <DesktopChatInput
      inputHeight={inputHeight}
      leftActions={leftActions}
      onInputHeightChange={(height) => {
        updatePreference({ inputHeight: height });
      }}
      renderFooter={renderFooter}
      renderTextArea={renderTextArea}
      rightActions={rightActions}
    />
  );
});

export default Desktop;
