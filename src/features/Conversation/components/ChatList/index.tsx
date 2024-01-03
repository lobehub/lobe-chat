import { Fragment, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import type { ChatMessage } from '@/types/message';

import HistoryDivider from './HistoryDivider';
import Item, { ListItemProps } from './Item';
import { useStyles } from './style';

export interface ChatListProps extends ListItemProps {
  className?: string;
  /**
   * @description Data of chat messages to be displayed
   */
  data: ChatMessage[];
  enableHistoryCount?: boolean;
  historyCount?: number;
  loadingId?: string;
}
export type {
  OnActionsClick,
  OnAvatatsClick,
  OnMessageChange,
  RenderAction,
  RenderErrorMessage,
  RenderItem,
  RenderMessage,
  RenderMessageExtra,
} from './Item';

const ChatList = memo<ChatListProps>(
  ({
    onActionsClick,
    onAvatarsClick,
    renderMessagesExtra,
    className,
    data,
    type = 'chat',
    text,
    showTitle,
    onMessageChange,
    renderMessages,
    renderErrorMessages,
    loadingId,
    renderItems,
    enableHistoryCount,
    renderActions,
    historyCount = 0,
  }) => {
    const { cx, styles } = useStyles();

    return (
      <Flexbox className={cx(styles.container, className)}>
        {data.map((item, index) => {
          const itemProps = {
            loading: loadingId === item.id,
            onActionsClick,
            onAvatarsClick,
            onMessageChange,
            renderActions,
            renderErrorMessages,
            renderItems,
            renderMessages,
            renderMessagesExtra,
            showTitle,
            text,
            type,
          };

          const historyLength = data.length;
          const enableHistoryDivider =
            enableHistoryCount &&
            historyLength > historyCount &&
            historyCount === historyLength - index + 1;

          return (
            <Fragment key={item.id}>
              <HistoryDivider enable={enableHistoryDivider} text={text?.history} />
              <Item {...itemProps} {...item} />
            </Fragment>
          );
        })}
      </Flexbox>
    );
  },
);

export default ChatList;
