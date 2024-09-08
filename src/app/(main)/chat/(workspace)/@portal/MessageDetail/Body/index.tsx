import { Markdown } from '@lobehub/ui';
import { css, cx } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { chatPortalSelectors, chatSelectors } from '@/store/chat/selectors';

const md = css`
  overflow: scroll;

  > div {
    padding-block-end: 40px;
  }
`;

const MessageDetailBody = () => {
  const [messageDetailId] = useChatStore((s) => [chatPortalSelectors.messageDetailId(s)]);

  const message = useChatStore(chatSelectors.getMessageById(messageDetailId || ''), isEqual);

  const content = message?.content || '';

  return (
    <Flexbox height={'100%'} paddingBlock={'0 12px'} paddingInline={8}>
      {!!content && (
        <Markdown className={cx(md)} variant={'chat'}>
          {content}
        </Markdown>
      )}
    </Flexbox>
  );
};

export default MessageDetailBody;
