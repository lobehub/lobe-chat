'use client';

import { memo } from 'react';

import { ActionKeys } from '@/features/ChatInput/ActionBar/config';
import DesktopChatInput, { FooterRender } from '@/features/ChatInput/Desktop';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

import Footer from './Footer';
import TextArea from './TextArea';

// DM Actions
const leftActions = [
  'model',
  'search',
  'fileUpload',
  'knowledgeBase',
  'params',
  'history',
  'stt',
  'tools',
  'mainToken',
] as ActionKeys[];

// Group Chat Actions
const leftActionsForGroup = ['stt', 'mention', 'fileUpload', 'knowledgeBase'] as ActionKeys[];

const rightActions = ['clear'] as ActionKeys[];

interface DesktopProps {
  targetMemberId?: string;
}

const Desktop = memo<DesktopProps>(({ targetMemberId }) => {
  const renderTextArea = (onSend: () => void) => (
    <TextArea onSend={onSend} targetMemberId={targetMemberId} />
  );
  const renderFooter: FooterRender = ({ expand, onExpandChange }) => (
    <Footer expand={expand} inThread={!!targetMemberId} onExpandChange={onExpandChange} />
  );
  const [inputHeight, updatePreference] = useGlobalStore((s) => [
    systemStatusSelectors.inputHeight(s),
    s.updateSystemStatus,
  ]);

  const isGroupSession = useSessionStore(sessionSelectors.isCurrentSessionGroupSession);

  return (
    <DesktopChatInput
      inThread={!!targetMemberId}
      inputHeight={inputHeight}
      leftActions={isGroupSession ? leftActionsForGroup : leftActions}
      onInputHeightChange={(height) => {
        updatePreference({ inputHeight: height });
      }}
      renderFooter={renderFooter}
      renderTextArea={renderTextArea}
      rightActions={targetMemberId ? [] : rightActions}
    />
  );
});

export default Desktop;
