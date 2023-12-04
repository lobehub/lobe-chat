import { Icon } from '@lobehub/ui';
import { Button } from 'antd';
import { Loader2, SendHorizonal } from 'lucide-react';
import { memo } from 'react';

import { useSendMessage } from '@/app/chat/features/ChatInput/useSend';
import { useChatStore } from '@/store/chat';

const SendButton = memo(() => {
  const [loading, onStop] = useChatStore((s) => [!!s.chatLoadingId, s.stopGenerateMessage]);

  const handleSend = useSendMessage();

  return loading ? (
    <Button
      icon={loading && <Icon icon={Loader2} spin />}
      onClick={onStop}
      style={{ flex: 'none' }}
    />
  ) : (
    <Button
      icon={<Icon icon={SendHorizonal} />}
      onClick={handleSend}
      style={{ flex: 'none' }}
      type={'primary'}
    />
  );
});

export default SendButton;
