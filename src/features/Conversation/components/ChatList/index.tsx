import isEqual from 'fast-deep-equal';
import { Fragment, memo } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Flexbox } from 'react-layout-kit';

import { PREFIX_KEY, REGENERATE_KEY } from '@/const/hotkeys';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/slices/message/selectors';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/slices/agent';

import Item from '../ChatItem';
import HistoryDivider from './HistoryDivider';
import { useStyles } from './style';

const ChatList = memo(() => {
  const { styles } = useStyles();
  const meta = useSessionStore(agentSelectors.currentAgentMeta, isEqual);
  const data = useChatStore(chatSelectors.currentChatsWithGuideMessage(meta), isEqual);

  const hotkeys = [PREFIX_KEY, REGENERATE_KEY].join('+');

  const [resendMessage] = useChatStore((s) => [s.resendMessage]);

  const [enableHistoryCount, historyCount = 0] = useSessionStore((s) => {
    const config = agentSelectors.currentAgentConfig(s);
    return [config.enableHistoryCount, config.historyCount];
  });

  useHotkeys(
    hotkeys,
    () => {
      const lastMessage = data.at(-1);
      if (!lastMessage || lastMessage.id === 'default' || lastMessage.role === 'system') return;
      resendMessage(lastMessage.id);
    },
    {
      enableOnFormTags: true,
      preventDefault: true,
    },
  );

  return (
    <Flexbox className={styles.container}>
      {data.map((item, index) => {
        const historyLength = data.length;
        const enableHistoryDivider =
          enableHistoryCount &&
          historyLength > historyCount &&
          historyCount === historyLength - index + 1;

        return (
          <Fragment key={item.id}>
            <HistoryDivider enable={enableHistoryDivider} />
            <Item {...item} />
          </Fragment>
        );
      })}
    </Flexbox>
  );
});

export default ChatList;
