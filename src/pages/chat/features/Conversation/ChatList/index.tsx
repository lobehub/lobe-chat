import { ChatList, RenderErrorMessage, RenderMessage } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { DEFAULT_INBOX_AVATAR } from '@/const/meta';
import { INBOX_SESSION_ID } from '@/const/session';
import {
  agentSelectors,
  chatSelectors,
  useSessionHydrated,
  useSessionStore,
} from '@/store/session';
import { ChatMessage } from '@/types/chatMessage';
import { ErrorType } from '@/types/fetch';
import { isFunctionMessage } from '@/utils/message';

import InvalidAccess from './Error/InvalidAccess';
import OpenAiBizError from './Error/OpenAiBizError';
import MessageExtra from './MessageExtra';
import FunctionCall from './Plugins/FunctionCall';
import PluginMessage from './Plugins/PluginMessage';
import SkeletonList from './SkeletonList';

const renderErrorMessage: RenderErrorMessage = (error, message) => {
  switch (error.type as ErrorType) {
    case 'InvalidAccessCode': {
      return <InvalidAccess id={message.id} />;
    }
    case 'OpenAIBizError': {
      return <OpenAiBizError content={(error as any).body} id={message.id} />;
    }
  }
};

const List = () => {
  const init = useSessionHydrated();
  const { t } = useTranslation('common');

  const data = useSessionStore(chatSelectors.currentChats, isEqual);

  const [isInbox, displayMode, chatLoadingId, deleteMessage, resendMessage, dispatchMessage] =
    useSessionStore((s) => [
      s.activeId === INBOX_SESSION_ID,
      agentSelectors.currentAgentConfig(s).displayMode,
      s.chatLoadingId,
      s.deleteMessage,
      s.resendMessage,
      s.dispatchMessage,
    ]);

  const renderMessage: RenderMessage = useCallback(
    (content, message: ChatMessage) => {
      if (message.role === 'function')
        return (
          <Flexbox gap={12}>
            <FunctionCall
              content={message.content}
              function_call={message.function_call}
              loading={message.id === chatLoadingId}
            />
            <PluginMessage loading={message.id === chatLoadingId} {...message} />
          </Flexbox>
        );

      if (message.role === 'assistant') {
        return isFunctionMessage(message.content) || !!message.function_call ? (
          <FunctionCall
            content={message.content}
            function_call={message.function_call}
            loading={message.id === chatLoadingId}
          />
        ) : (
          content
        );
      }

      return content;
    },
    [chatLoadingId],
  );

  // 针对 inbox 添加初始化时的自定义消息
  const displayDataSource = useMemo(() => {
    const emptyGuideMessage = {
      content: t('inbox.defaultMessage'),
      createAt: Date.now(),
      extra: {},
      id: 'default',
      meta: {
        avatar: DEFAULT_INBOX_AVATAR,
      },
      role: 'assistant',
      updateAt: Date.now(),
    } as ChatMessage;

    return isInbox && data.length === 0 ? [emptyGuideMessage] : data;
  }, [data]);

  return !init ? (
    <SkeletonList />
  ) : (
    <ChatList
      data={displayDataSource}
      loadingId={chatLoadingId}
      onActionClick={(key, id) => {
        switch (key) {
          case 'delete': {
            deleteMessage(id);
            break;
          }

          case 'regenerate': {
            resendMessage(id);
            break;
          }
        }
      }}
      onMessageChange={(id, content) => {
        dispatchMessage({ id, key: 'content', type: 'updateMessage', value: content });
      }}
      renderErrorMessage={renderErrorMessage}
      renderMessage={renderMessage}
      renderMessageExtra={MessageExtra}
      style={{ marginTop: 24 }}
      text={{
        cancel: t('cancel'),
        confirm: t('ok'),
        copy: t('copy'),
        copySuccess: t('copySuccess'),
        delete: t('delete'),
        edit: t('edit'),
        regenerate: t('regenerate'),
      }}
      type={displayMode}
    />
  );
};

export default memo(List);
