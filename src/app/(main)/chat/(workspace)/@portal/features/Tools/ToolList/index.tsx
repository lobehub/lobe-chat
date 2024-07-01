import { Skeleton } from 'antd';
import isEqual from 'fast-deep-equal';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import ToolItem from './Item';

const ToolList = () => {
  const messages = useChatStore(chatSelectors.currentToolMessages, isEqual);
  const isCurrentChatLoaded = useChatStore(chatSelectors.isCurrentChatLoaded);

  return !isCurrentChatLoaded ? (
    <Flexbox gap={12} paddingInline={12}>
      {[1, 1, 1, 1, 1, 1].map((key, index) => (
        <Skeleton.Button
          active
          block
          key={`${key}-${index}`}
          style={{ borderRadius: 8, height: 68 }}
        />
      ))}
    </Flexbox>
  ) : (
    <Flexbox gap={12} paddingInline={12}>
      {messages.map((m) => (
        <ToolItem
          identifier={m.plugin?.identifier}
          key={m.id}
          messageId={m.id}
          payload={m.plugin}
        />
      ))}
    </Flexbox>
  );
};

export default ToolList;
