import { Suspense, memo } from 'react';

import { LOADING_FLAT } from '@/const/message';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import Arguments from './Arguments';
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
    const loading = useChatStore(chatSelectors.isToolCallStreaming(messageId, toolIndex));
    const toolMessage = useChatStore(chatSelectors.getMessageByToolCallId(toolCallId));

    // 如果处于 loading 或者找不到 toolMessage 则展示 Arguments
    if (loading || !toolMessage) return <Arguments arguments={requestArgs} />;

    if (!!toolMessage) {
      if (toolMessage.error) {
        return <ErrorResponse {...toolMessage.error} id={messageId} plugin={toolMessage.plugin} />;
      }

      // 如果是 LOADING_FLAT 则说明还在加载中
      // 而 standalone 模式的插件 content 应该始终是 LOADING_FLAT
      if (toolMessage.content === LOADING_FLAT && toolMessage.plugin?.type !== 'standalone')
        return <Arguments arguments={requestArgs} shine />;

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
