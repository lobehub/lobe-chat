import { useCallback } from 'react';

import { useOpenChatSettings } from '@/hooks/useInterceptingRoutes';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

import { RenderBelowMessage, RenderMessage } from '../types';
import { AssistantMessage } from './Assistant';
import { DefaultBelowMessage, DefaultMessage } from './Default';
import Container from './User';

export const MESSAGES = {
  user: Container,
};

export const renderMessages: Record<string, RenderMessage> = {
  assistant: AssistantMessage,
  default: DefaultMessage,
  function: DefaultMessage,
};

export const renderBelowMessages: Record<string, RenderBelowMessage> = {
  default: DefaultBelowMessage,
};

export const useAvatarsClick = (role?: string) => {
  const [isInbox] = useSessionStore((s) => [sessionSelectors.isInboxSession(s)]);
  const [toggleSystemRole] = useGlobalStore((s) => [s.toggleSystemRole]);
  const openChatSettings = useOpenChatSettings();

  return useCallback(() => {
    switch (role) {
      case 'assistant': {
        if (!isInbox) {
          toggleSystemRole(true);
        } else {
          openChatSettings();
        }
      }
    }
  }, [isInbox, role]);
};
