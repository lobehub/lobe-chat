import { memo } from 'react';

import ShareModal from '@/features/ShareModal';
import { ChatMessage } from '@/types/message';

interface ShareMessageModalProps {
  message: ChatMessage;
  onClose: () => void;
  open: boolean;
}
const ShareMessageModal = memo<ShareMessageModalProps>(({ message, open, onClose }) => {
  return (
    <ShareModal
      displayMessageIds={[message.id]}
      messages={[message]}
      onCancel={onClose}
      open={open}
    />
  );
});

export default ShareMessageModal;
