import { CSSProperties, memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import Inspectors from './Inspector';
import Render from './Render';

export interface InspectorProps {
  apiName: string;
  arguments?: string;
  id: string;
  identifier: string;
  index: number;
  messageId: string;
  payload: object;
  style?: CSSProperties;
}

const Tool = memo<InspectorProps>(
  ({ arguments: requestArgs, apiName, messageId, id, index, identifier, style, payload }) => {
    const loading = useChatStore(chatSelectors.isToolCallStreaming(messageId, index));
    const [showRender, setShowRender] = useState(true);

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
          setShowRender={setShowRender}
          showRender={showRender}
        />
        {showRender && <Render messageId={messageId} toolCallId={id} toolIndex={index} />}
      </Flexbox>
    );
  },
);

export default Tool;
