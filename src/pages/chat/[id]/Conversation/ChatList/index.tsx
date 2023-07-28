import { ChatList, RenderErrorMessage, RenderMessage } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { shallow } from 'zustand/shallow';

import { agentSelectors, chatSelectors, useSessionStore } from '@/store/session';
import { ErrorType } from '@/types/fetch';
import { isFunctionMessage } from '@/utils/message';

import InvalidAccess from './Error/InvalidAccess';
import OpenAiBizError from './Error/OpenAiBizError';
import FunctionMessage from './FunctionMessage';
import MessageExtra from './MessageExtra';

const renderMessage: RenderMessage = (content, message) => {
  if (message.role === 'function')
    return isFunctionMessage(message.content) ? <FunctionMessage /> : content;

  return content;
};

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
  const { t } = useTranslation('common');
  const data = useSessionStore(chatSelectors.currentChats, isEqual);
  const [displayMode, chatLoadingId, deleteMessage, resendMessage, dispatchMessage] =
    useSessionStore(
      (s) => [
        agentSelectors.currentAgentConfigSafe(s).displayMode,
        s.chatLoadingId,
        s.deleteMessage,
        s.resendMessage,
        s.dispatchMessage,
      ],
      shallow,
    );

  return (
    <ChatList
      data={data}
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
