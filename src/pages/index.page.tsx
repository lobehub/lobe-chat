import { ChatList, Conversation } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { memo, useEffect } from 'react';
import { shallow } from 'zustand/shallow';

import { useChatStore } from '@/store/session';

import ChatLayout from '@/pages/ChatLayout';
import { chatSelectors } from '@/store/session/selectors';

const Chat = memo(() => {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (typeof id === 'string') {
      useChatStore.setState({ activeId: id });
    }
  }, [id]);

  const context = useChatStore(chatSelectors.currentChat, isEqual);
  const [dispatchChat, dispatchAgent, addAgentToChat] = useChatStore(
    (s) => [s.dispatchSession, s.dispatchAgent, s.addAgentToChat],
    shallow,
  );

  return (
    <>
      <ChatList data={[]}></ChatList>
      <Conversation
        {...context}
        title={context?.title || ''}
        description={context?.description || ''}
        onAgentChange={(agent, type) => {
          switch (type) {
            default:
            case 'update':
              // 没有 agent Id 的话，说明是新建，需要绑定 id
              if (!agent.id) {
                addAgentToChat(context!.id, agent);
              } else {
                dispatchAgent({
                  type: 'updateAgentData',
                  key: 'content',
                  value: agent.content,
                  id: agent.id,
                });
              }
              break;
            case 'remove':
              dispatchChat({
                type: 'updateSessionChatContext',
                key: 'agentId',
                id: context!.id,
                value: null,
              });
          }
        }}
        onMessagesChange={(value) => {
          dispatchChat({
            type: 'updateSessionChatContext',
            id: id as string,
            key: 'messages',
            value,
          });
        }}
      />
    </>
  );
});

const Session: NextPage = () => {
  const [title] = useChatStore((s) => {
    const context = chatSelectors.currentChat(s);
    return [context?.meta.title];
  }, isEqual);

  return (
    <>
      <Head>
        <title>{title ? `${title} - LobeChat` : 'LobeChat'}</title>
      </Head>
      <ChatLayout>
        {/*<Header shareable={hasMsg} onShare={genShareUrl} />*/}
        <Chat />
      </ChatLayout>
    </>
  );
};

export default Session;
