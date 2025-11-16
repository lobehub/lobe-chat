import { Suspense, memo } from 'react';

import { useChatStore } from '@/store/chat';
import { dbMessageSelectors, messageStateSelectors } from '@/store/chat/selectors';

import CustomRender from './CustomRender';
import ErrorResponse from './ErrorResponse';

interface RenderProps {
  messageId: string;
  requestArgs?: string;
  setShowPluginRender: (show: boolean) => void;
  showPluginRender: boolean;
  toolCallId: string;
  toolIndex: number;
}

const Render = memo<RenderProps>(
  ({ toolCallId, toolIndex, messageId, requestArgs, showPluginRender, setShowPluginRender }) => {
    const loading = useChatStore(messageStateSelectors.isToolCallStreaming(messageId, toolIndex));
    const toolMessage = useChatStore(dbMessageSelectors.getDbMessageByToolCallId(toolCallId));

    if (loading || !toolMessage) return null;

    if (!!toolMessage) {
      if (toolMessage.error) {
        return <ErrorResponse {...toolMessage.error} id={messageId} plugin={toolMessage.plugin} />;
      }

      return (
        <Suspense>
          <CustomRender
            {...toolMessage}
            requestArgs={requestArgs}
            setShowPluginRender={setShowPluginRender}
            showPluginRender={showPluginRender}
          />
        </Suspense>
      );
    }
  },
);

Render.displayName = 'ToolRender';

export default Render;
