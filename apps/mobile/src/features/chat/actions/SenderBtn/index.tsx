import SendButton from '@/components/SendButton';
import { useChat } from '@/hooks/useChat';

interface SenderBtnProps {
  onSend?: () => void;
  onStop?: () => void;
}

const SenderBtn = ({ onSend: customOnSend, onStop: customOnStop }: SenderBtnProps) => {
  const { handleSubmit, isLoading, isGenerating, canSend, stopGenerating } = useChat();

  return (
    <SendButton
      disabled={!canSend}
      generating={isGenerating}
      loading={isLoading}
      onSend={customOnSend || handleSubmit}
      onStop={customOnStop || stopGenerating}
      size="small"
    />
  );
};

export default SenderBtn;
