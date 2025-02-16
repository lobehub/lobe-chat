import { ActionIcon, type ActionIconSize, Icon } from '@lobehub/ui';
import { Button } from 'antd';
import { Loader2, SendHorizontal } from 'lucide-react';
import { memo } from 'react';

export interface MobileChatSendButtonProps {
  disabled?: boolean;
  loading?: boolean;
  onSend?: () => void;
  onStop?: () => void;
}

const MobileChatSendButton = memo<MobileChatSendButtonProps>(
  ({ loading, onStop, onSend, disabled }) => {
    const size: ActionIconSize = {
      blockSize: 36,
      fontSize: 16,
    };

    return loading ? (
      <ActionIcon active icon={Loader2} onClick={onStop} size={size} spin />
    ) : (
      <Button
        disabled={disabled}
        icon={(<Icon icon={SendHorizontal} />) as any}
        onClick={onSend}
        style={{ flex: 'none' }}
        type={'primary'}
      />
    );
  },
);

export default MobileChatSendButton;
