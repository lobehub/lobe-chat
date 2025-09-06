import dynamic from 'next/dynamic';
import { PropsWithChildren, memo } from 'react';

import { useModelHasContextWindowToken } from '@/hooks/useModelHasContextWindowToken';
import { useChatStore } from '@/store/chat';
import { chatSelectors, threadSelectors } from '@/store/chat/selectors';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';

const LargeTokenContent = dynamic(() => import('./TokenTag'), { ssr: false });
const LargeTokenContentForGroupChat = dynamic(() => import('./TokenTagForGroupChat'), {
  ssr: false,
});

const Token = memo<PropsWithChildren>(({ children }) => {
  const showTag = useModelHasContextWindowToken();

  return showTag && children;
});

export const MainToken = memo(() => {
  const total = useChatStore(chatSelectors.mainAIChatsMessageString);
  const isGroupSession = useSessionStore(sessionSelectors.isCurrentSessionGroupSession);

  return (
    <Token>
      {isGroupSession ? (
        <LargeTokenContentForGroupChat total={total} />
      ) : (
        <LargeTokenContent total={total} />
      )}
    </Token>
  );
});

export const PortalToken = memo(() => {
  const total = useChatStore(threadSelectors.portalDisplayChatsString);

  return (
    <Token>
      <LargeTokenContent total={total} />
    </Token>
  );
});
