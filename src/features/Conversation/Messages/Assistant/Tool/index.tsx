import { CSSProperties, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import Inspectors from './Inspector';
import Tool from './Tool';

export interface InspectorProps {
  apiName: string;
  arguments?: string;
  id: string;
  identifier: string;
  index: number;
  messageId: string;
  payload: object;
  showPortal?: boolean;
  style?: CSSProperties;
}

const CallItem = memo<InspectorProps>(
  ({
    arguments: requestArgs,
    apiName,
    messageId,
    id,
    index,
    identifier,
    style,
    showPortal,
    payload,
  }) => {
    const loading = useChatStore(chatSelectors.isToolCallStreaming(messageId, index));
    const toolMessage = useChatStore(chatSelectors.getMessageByToolCallId(id));

    return (
      <Flexbox gap={8} style={style}>
        <Inspectors
          apiName={apiName}
          arguments={requestArgs}
          id={id}
          identifier={identifier}
          index={index}
          messageId={messageId}
          payload={payload}
        />
        {!loading && toolMessage && <Tool {...toolMessage} showPortal={showPortal} />}
      </Flexbox>
    );
  },
);

export default CallItem;
