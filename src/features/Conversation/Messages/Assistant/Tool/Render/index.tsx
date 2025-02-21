import { memo } from 'react';

import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';

import Arguments from './Arguments';
import CustomRender from './CustomRender';

interface RenderProps {
  messageId: string;
  requestArgs?: string;
  toolCallId: string;
  toolIndex: number;
}
const Render = memo<RenderProps>(({ toolCallId, toolIndex, messageId, requestArgs }) => {
  const loading = useChatStore(chatSelectors.isToolCallStreaming(messageId, toolIndex));
  const toolMessage = useChatStore(chatSelectors.getMessageByToolCallId(toolCallId));

  // 如果处于 loading 或者找不到 toolMessage 则展示 Arguments
  if (loading || !toolMessage) return <Arguments arguments={requestArgs} />;

  if (!!toolMessage) return <CustomRender {...toolMessage} requestArgs={requestArgs} />;
});

export default Render;
