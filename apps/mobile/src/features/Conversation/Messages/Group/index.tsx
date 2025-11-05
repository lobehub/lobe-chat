import { UIChatMessage } from '@lobechat/types';
import { Flexbox } from '@lobehub/ui-rn';
import { memo } from 'react';

import { createStyles } from '@/components/styles';
import ChatItem from '@/features/ChatItem';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import { GroupActionsBar } from './Actions';
import GroupChildren from './GroupChildren';

const useStyles = createStyles(() => ({
  container: {
    width: '100%',
  },
  messageContent: {
    width: '100%',
  },
}));

interface GroupMessageProps extends UIChatMessage {
  disableEditing?: boolean;
  index: number;
  isGenerating?: boolean;
  isLastMessage?: boolean;
  showActions?: boolean;
  showTime?: boolean;
  showTitle?: boolean;
}

const GroupMessage = memo<GroupMessageProps>((props) => {
  const {
    showTitle = true,
    showTime = true,
    showActions = true,
    id,
    disableEditing,
    index,
    createdAt,
    meta,
    children,
    isGenerating,
    isLastMessage,
  } = props;
  const avatar = meta;
  const { styles } = useStyles();

  // Get the latest assistant message without tools for actions
  const lastAssistantMsg = useChatStore(chatSelectors.getGroupLatestMessageWithoutTools(id));
  const contentId = lastAssistantMsg?.id;

  const actionsNode =
    showActions && isLastMessage && contentId ? (
      <GroupActionsBar
        contentBlock={lastAssistantMsg}
        contentId={contentId}
        data={props}
        id={id}
        index={index}
      />
    ) : undefined;

  return (
    <Flexbox gap={8} style={styles.container}>
      <ChatItem
        actions={actionsNode}
        avatar={{
          avatar: avatar?.avatar,
          backgroundColor: avatar?.backgroundColor,
          title: avatar?.title,
        }}
        placement="left"
        primary={false}
        renderMessage={() => (
          <Flexbox gap={8} style={styles.messageContent}>
            {children && children.length > 0 && (
              <GroupChildren
                blocks={children}
                contentId={contentId}
                disableEditing={disableEditing}
                isGenerating={isGenerating}
                messageIndex={index}
              />
            )}
          </Flexbox>
        )}
        showTime={showTime}
        showTitle={showTitle}
        time={createdAt}
        variant="bubble"
      />
    </Flexbox>
  );
});

GroupMessage.displayName = 'GroupMessage';

export default GroupMessage;
