import { useResponsive } from 'antd-style';
import { useRouter } from 'next/navigation';

import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { pathString } from '@/utils/url';

import { OnAvatarsClick, RenderMessage } from '../types';
import { AssistantMessage } from './Assistant';
import { DefaultMessage } from './Default';
import { FunctionMessage } from './Function';
import { UserMessage } from './User';

export const renderMessages: Record<string, RenderMessage> = {
  assistant: AssistantMessage,
  default: DefaultMessage,
  function: FunctionMessage,
  user: UserMessage,
};

export const useAvatarsClick = (): OnAvatarsClick => {
  const [isInbox] = useSessionStore((s) => [sessionSelectors.isInboxSession(s)]);
  const [toggleSystemRole] = useGlobalStore((s) => [s.toggleSystemRole]);
  const { mobile } = useResponsive();
  const router = useRouter();

  return (role) => {
    switch (role) {
      case 'assistant': {
        return () =>
          isInbox
            ? router.push('/settings/agent')
            : mobile
              ? router.push(pathString('/chat/settings', { hash: location.hash }))
              : toggleSystemRole(true);
      }
    }
  };
};
