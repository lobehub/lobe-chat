import isEqual from 'fast-deep-equal';
import { Fragment, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

import Item from '../ChatItem';
import HistoryDivider from './HistoryDivider';
import { useStyles } from './style';

const ChatList = memo(() => {
  const { styles } = useStyles();

  const data = useChatStore(chatSelectors.currentChatIDsWithGuideMessage, isEqual);

  const [enableHistoryCount, historyCount = 0] = useSessionStore((s) => {
    const config = agentSelectors.currentAgentConfig(s);
    return [config.enableHistoryCount, config.historyCount];
  });

  return (
    <Flexbox className={styles.container}>
      {data.map((item, index) => {
        const historyLength = data.length;
        const enableHistoryDivider =
          enableHistoryCount &&
          historyLength > historyCount &&
          historyCount === historyLength - index + 1;

        return (
          <Fragment key={item}>
            <HistoryDivider enable={enableHistoryDivider} />
            <Item index={index} />
          </Fragment>
        );
      })}
    </Flexbox>
  );
});

export default ChatList;
