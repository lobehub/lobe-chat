import { DEFAULT_USER_AVATAR } from '@lobechat/const';
import { ChatMessage } from '@lobechat/types';
import type { ActionIconGroupEvent } from '@lobehub/ui';
import { App } from 'antd';
import { useResponsive } from 'antd-style';
import { useSearchParams } from 'next/navigation';
import { MouseEventHandler, ReactNode, memo, use, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import Actions from '@/features/ChatItem/ChatItem/components/Actions';
import Avatar from '@/features/ChatItem/ChatItem/components/Avatar';
import BorderSpacing from '@/features/ChatItem/ChatItem/components/BorderSpacing';
import MessageContent from '@/features/ChatItem/ChatItem/components/MessageContent';
import Title from '@/features/ChatItem/ChatItem/components/Title';
import { useStyles } from '@/features/ChatItem/ChatItem/style';
import { UserBelowMessage } from '@/features/Conversation/Messages/User/BelowMessage';
import { UserMessageContent } from '@/features/Conversation/Messages/User/MessageContent';
import { InPortalThreadContext } from '@/features/Conversation/components/ChatItem/InPortalThreadContext';
import { VirtuosoContext } from '@/features/Conversation/components/VirtualizedList/VirtuosoContext';
import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';

import { UserActionsBar } from './Actions';
import { UserMessageExtra } from './Extra';
import { MarkdownRender as UserMarkdownRender } from './MarkdownRender';

interface UserMessageProps extends ChatMessage {
  disableEditing?: boolean;
  index: number;
}

const UserMessage = memo<UserMessageProps>((props) => {
  const { id, ragQuery, content, createdAt, error, role, index, extra, disableEditing } = props;

  const { mobile } = useResponsive();
  const title = useUserStore(userProfileSelectors.displayUserName);
  const avatar = useUserStore(userProfileSelectors.userAvatar) || DEFAULT_USER_AVATAR;
  const displayMode = useAgentStore(agentChatConfigSelectors.displayMode);
  const [
    editing,
    generating,
    isInRAGFlow,
    toggleMessageEditing,
    updateMessageContent,
    deleteMessage,
    regenerateMessage,
    translateMessage,
    ttsMessage,
    delAndRegenerateMessage,
    copyMessage,
    openThreadCreator,
    resendThreadMessage,
    delAndResendThreadMessage,
  ] = useChatStore((s) => [
    chatSelectors.isMessageEditing(id)(s),
    chatSelectors.isMessageGenerating(id)(s),
    chatSelectors.isMessageInRAGFlow(id)(s),
    s.toggleMessageEditing,
    s.modifyMessageContent,
    s.deleteMessage,
    s.regenerateMessage,
    s.translateMessage,
    s.ttsMessage,
    s.delAndRegenerateMessage,
    s.copyMessage,
    s.openThreadCreator,
    s.resendThreadMessage,
    s.delAndResendThreadMessage,
  ]);

  const loading = isInRAGFlow || generating;

  const placement = displayMode === 'chat' ? 'right' : 'left';
  const variant = displayMode === 'chat' ? 'bubble' : 'docs';

  const { styles } = useStyles({
    editing,
    placement,
    primary: true,
    showTitle: false,
    time: createdAt,
    title,
    variant,
  });

  const { t } = useTranslation('common');
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic');

  const { message } = App.useApp();

  // 在 ChatItem 组件中添加
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // remove line breaks in artifact tag to make the ast transform easier

  const virtuosoRef = use(VirtuosoContext);
  const inPortalThread = use(InPortalThreadContext);

  const onDoubleClick = useCallback<MouseEventHandler<HTMLDivElement>>(
    (e) => {
      if (disableEditing || id === 'default' || error || !e.altKey) return;

      toggleMessageEditing(id, true);

      virtuosoRef?.current?.scrollIntoView({ align: 'start', behavior: 'auto', index });
    },
    [role, disableEditing, error],
  );

  const onActionClick = useCallback(
    async (action: ActionIconGroupEvent) => {
      switch (action.key) {
        case 'edit': {
          toggleMessageEditing(id, true);

          virtuosoRef?.current?.scrollIntoView({ align: 'start', behavior: 'auto', index });
        }
      }

      switch (action.key) {
        case 'copy': {
          await copyMessage(id, props.content);
          message.success(t('copySuccess'));
          break;
        }

        case 'branching': {
          if (!topic) {
            message.warning(t('branchingRequiresSavedTopic'));
            break;
          }
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
          if (props.error) deleteMessage(id);
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
      }

      if (action.keyPath.at(-1) === 'translate') {
        // click the menu item with translate item, the result is:
        // key: 'en-US'
        // keyPath: ['en-US','translate']
        const lang = action.keyPath[0];
        translateMessage(id, lang);
      }
    },
    [props, inPortalThread],
  );
  return (
    <Flexbox
      className={styles.container}
      direction={placement === 'left' ? 'horizontal' : 'horizontal-reverse'}
      gap={mobile ? 6 : 12}
    >
      <Avatar
        alt={title}
        avatar={{ avatar, title }}
        loading={loading}
        placement={placement}
        size={mobile ? 32 : undefined}
        style={{ marginTop: 6 }}
      />
      <Flexbox
        align={placement === 'left' ? 'flex-start' : 'flex-end'}
        className={styles.messageContainer}
        ref={containerRef}
      >
        <Title
          avatar={{ avatar, title }}
          placement={placement}
          showTitle={false}
          time={createdAt}
        />
        <Flexbox
          align={placement === 'left' ? 'flex-start' : 'flex-end'}
          className={styles.messageContent}
          direction={placement === 'left' ? 'horizontal' : 'horizontal-reverse'}
          gap={8}
        >
          <Flexbox ref={contentRef} width={'100%'}>
            <MessageContent
              editing={editing}
              markdownProps={{
                customRender: (dom: ReactNode, { text }: { text: string }) => {
                  return (
                    <UserMarkdownRender displayMode={displayMode} dom={dom} id={id} text={text} />
                  );
                },
              }}
              message={content}
              messageExtra={<UserMessageExtra content={content} extra={extra} id={id} />}
              onChange={(value) => {
                updateMessageContent(id, value);
              }}
              onDoubleClick={onDoubleClick}
              onEditingChange={(edit) => toggleMessageEditing(id, edit)}
              placement={placement}
              primary
              renderMessage={(editableContent: ReactNode) => (
                <UserMessageContent {...props} editableContent={editableContent} />
              )}
              variant={variant}
            />
          </Flexbox>

          <Actions
            actions={<UserActionsBar id={id} onActionClick={onActionClick} />}
            editing={editing}
            placement={placement}
            variant={variant}
          />
        </Flexbox>
        <UserBelowMessage content={content} id={id} ragQuery={ragQuery} />
      </Flexbox>
      {mobile && variant === 'bubble' && <BorderSpacing borderSpacing={32} />}
    </Flexbox>
  );
});

export default UserMessage;
