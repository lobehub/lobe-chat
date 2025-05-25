import { ActionIconGroup, type ActionIconGroupEvent, type ActionIconGroupProps } from '@lobehub/ui';
import { App } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo, use, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { VirtuosoContext } from '@/features/Conversation/components/VirtualizedList/VirtuosoContext';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { MessageRoleType } from '@/types/message';

import { renderActions } from '../../Actions';
import { useChatListActionsBar } from '../../hooks/useChatListActionsBar';
import ShareMessageModal from './ShareMessageModal';

export type ActionsBarProps = ActionIconGroupProps;

const ActionsBar = memo<ActionsBarProps>((props) => {
  const { regenerate, edit, copy, divider, del } = useChatListActionsBar();

  return (
    <ActionIconGroup
      items={[regenerate, edit]}
      menu={{
        items: [edit, copy, regenerate, divider, del],
      }}
      {...props}
    />
  );
});

interface ActionsProps {
  id: string;
  inPortalThread?: boolean;
  index: number;
}

const Actions = memo<ActionsProps>(({ id, inPortalThread, index }) => {
  const item = useChatStore(chatSelectors.getMessageById(id), isEqual);
  const { t } = useTranslation('common');
  const [
    deleteMessage,
    regenerateMessage,
    translateMessage,
    ttsMessage,
    delAndRegenerateMessage,
    copyMessage,
    openThreadCreator,
    resendThreadMessage,
    delAndResendThreadMessage,
    toggleMessageEditing,
  ] = useChatStore((s) => [
    s.deleteMessage,
    s.regenerateMessage,
    s.translateMessage,
    s.ttsMessage,
    s.delAndRegenerateMessage,
    s.copyMessage,
    s.openThreadCreator,
    s.resendThreadMessage,
    s.delAndResendThreadMessage,
    s.toggleMessageEditing,
  ]);
  const { message } = App.useApp();
  const virtuosoRef = use(VirtuosoContext);

  const [showShareModal, setShareModal] = useState(false);

  const handleActionClick = useCallback(
    async (action: ActionIconGroupEvent) => {
      switch (action.key) {
        case 'edit': {
          toggleMessageEditing(id, true);

          virtuosoRef?.current?.scrollIntoView({ align: 'start', behavior: 'auto', index });
        }
      }
      if (!item) return;

      switch (action.key) {
        case 'copy': {
          await copyMessage(id, item.content);
          message.success(t('copySuccess', { defaultValue: 'Copy Success' }));
          break;
        }
        case 'branching': {
          openThreadCreator(id);
          break;
        }

        case 'del': {
          deleteMessage(id);
          break;
        }

        case 'regenerate': {
          if (inPortalThread) {
            resendThreadMessage(id);
          } else regenerateMessage(id);

          // if this message is an error message, we need to delete it
          if (item.error) deleteMessage(id);
          break;
        }

        case 'delAndRegenerate': {
          if (inPortalThread) {
            delAndResendThreadMessage(id);
          } else {
            delAndRegenerateMessage(id);
          }
          break;
        }

        case 'tts': {
          ttsMessage(id);
          break;
        }

        // case 'export': {
        //   setModal(true);
        //   break;
        // }

        case 'share': {
          setShareModal(true);
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
    },
    [item],
  );

  const RenderFunction = renderActions[(item?.role || '') as MessageRoleType] ?? ActionsBar;

  if (!item) return null;

  return (
    <>
      <RenderFunction {...item} onActionClick={handleActionClick} />
      {/*{showModal && (*/}
      {/*  <ExportPreview content={item.content} onClose={() => setModal(false)} open={showModal} />*/}
      {/*)}*/}
      <ShareMessageModal
        message={item}
        onCancel={() => {
          setShareModal(false);
        }}
        open={showShareModal}
      />
    </>
  );
});

export default Actions;
