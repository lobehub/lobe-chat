import { copyToClipboard } from '@lobehub/ui';
import { App } from 'antd';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useChatStore } from '@/store/chat';
import { LLMRoleType } from '@/types/llm';

import { OnActionsClick, RenderAction } from '../types';
import { AssistantActionsBar } from './Assistant';
import { DefaultActionsBar } from './Fallback';
import { FunctionActionsBar } from './Function';
import { UserActionsBar } from './User';

export const renderActions: Record<LLMRoleType, RenderAction> = {
  assistant: AssistantActionsBar,
  function: FunctionActionsBar,
  system: DefaultActionsBar,
  user: UserActionsBar,
};

export const useActionsClick = (): OnActionsClick => {
  const { t } = useTranslation('common');
  const [deleteMessage, resendMessage, translateMessage, ttsMessage] = useChatStore((s) => [
    s.deleteMessage,
    s.resendMessage,
    s.translateMessage,
    s.ttsMessage,
  ]);
  const { message } = App.useApp();

  return useCallback<OnActionsClick>(async (action, { id, content, error }) => {
    switch (action.key) {
      case 'copy': {
        await copyToClipboard(content);
        message.success(t('copySuccess', { defaultValue: 'Copy Success' }));
        break;
      }

      case 'del': {
        deleteMessage(id);
        break;
      }

      case 'regenerate': {
        resendMessage(id);
        // if this message is an error message, we need to delete it
        if (error) deleteMessage(id);
        break;
      }

      case 'delAndRegenerate': {
        resendMessage(id);
        deleteMessage(id);
        break;
      }

      case 'tts': {
        ttsMessage(id);
        break;
      }
    }

    if (action.keyPath.at(-1) === 'translate') {
      // click the menu item with translate item, the result is:
      // key: 'en-US'
      // keyPath: ['en-US','translate']
      const lang = action.keyPath[0];
      translateMessage(id, lang);
    }
  }, []);
};
