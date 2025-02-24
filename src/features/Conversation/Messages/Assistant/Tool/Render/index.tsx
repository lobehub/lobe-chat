import { Suspense, memo } from 'react';

import ErrorResponse from '@/features/Conversation/Messages/Assistant/Tool/Render/ErrorResponse';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import Arguments from './Arguments';
import CustomRender from './CustomRender';

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
    const loading = useChatStore(chatSelectors.isToolCallStreaming(messageId, toolIndex));
    const toolMessage = useChatStore(chatSelectors.getMessageByToolCallId(toolCallId));

    // 如果处于 loading 或者找不到 toolMessage 则展示 Arguments
    if (loading || !toolMessage) return <Arguments arguments={requestArgs} />;

    if (!!toolMessage) {
      if (toolMessage.error) {
        return <ErrorResponse {...toolMessage.error} id={messageId} plugin={toolMessage.plugin} />;
      }

      return (
        <Suspense fallback={<Arguments arguments={requestArgs} shine />}>
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

export default Render;
