import SendButton from '@/components/SendButton';
import { useChat } from '@/hooks/useChat';

interface SendButtonWrapperProps {
  onSend?: () => void;
  onStop?: () => void;
}

const SendButtonWrapper = ({
  onSend: customOnSend,
  onStop: customOnStop,
}: SendButtonWrapperProps) => {
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

export default SendButtonWrapper;
