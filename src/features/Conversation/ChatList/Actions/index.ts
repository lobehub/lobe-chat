import { ChatListProps } from '@lobehub/ui';

import { useChatStore } from '@/store/chat';

import { AssistantActionsBar } from './Assistant';
import { DefaultActionsBar } from './Fallback';
import { FunctionActionsBar } from './Function';
import { UserActionsBar } from './User';

export const renderActions: ChatListProps['renderActions'] = {
  assistant: AssistantActionsBar,
  function: FunctionActionsBar,
  system: DefaultActionsBar,
  user: UserActionsBar,
};

interface ActionsClick {
  onClick: () => void;
  trigger: boolean;
}

export const useActionsClick = (): ChatListProps['onActionsClick'] => {
  const [deleteMessage, resendMessage, translateMessage, ttsMessage] = useChatStore((s) => [
    s.deleteMessage,
    s.resendMessage,
    s.translateMessage,
    s.ttsMessage,
  ]);

  return (action, { id, error }) => {
    const actionsClick: ActionsClick[] = [
      {
        onClick: () => {
          deleteMessage(id);
        },
        trigger: action.key === 'del',
      },
      {
        onClick: () => {
          resendMessage(id);
          // if this message is an error message, we need to delete it
          if (error) deleteMessage(id);
        },
        trigger: action.key === 'regenerate',
      },
      {
        onClick: () => {
          ttsMessage(id);
        },
        trigger: action.key === 'tts',
      },
      {
        onClick: () => {
          /**
           * @description Click the menu item with translate item, the result is:
           * @key 'en-US'
           * @keyPath ['en-US','translate']
           */
          const lang = action.keyPath[0];
          translateMessage(id, lang);
        },
        trigger: action.keyPath.at(-1) === 'translate',
      },
    ];

    actionsClick.find((item) => item.trigger)?.onClick();
  };
};
