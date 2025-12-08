'use client';

import { memo } from 'react';

import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

import ClassicChatInput from './ClassicChat';
import GroupChatInput from './GroupChat';

const Desktop = memo((props: { targetMemberId?: string }) => {
  const isGroupSession = useSessionStore(sessionSelectors.isCurrentSessionGroupSession);
  return isGroupSession ? <GroupChatInput {...props} /> : <ClassicChatInput />;
});

export default Desktop;
