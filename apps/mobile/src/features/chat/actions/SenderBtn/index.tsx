import SendButton from '@/components/SendButton';
import { useChat } from '@/hooks/useChat';

const SenderBtn = () => {
  const { handleSubmit, isLoading, isGenerating, canSend, stopGenerating } = useChat();

  return (
    <SendButton
      disabled={!canSend}
      generating={isGenerating}
      loading={isLoading}
      onSend={handleSubmit}
      onStop={stopGenerating}
      size="small"
    />
  );
};

export default SenderBtn;
