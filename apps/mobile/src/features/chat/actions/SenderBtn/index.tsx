import { ArrowUp } from 'lucide-react-native';
import StopLoadingIcon from './StopLoadingIcon';
import { useChat } from '@/hooks/useChat';
import { Button } from '@/components';

const SenderBtn = () => {
  const { handleSubmit, isLoading, canSend, stopGenerating } = useChat();

  return (
    <Button
      disabled={!canSend}
      icon={isLoading ? <StopLoadingIcon /> : <ArrowUp />}
      onPress={isLoading ? stopGenerating : handleSubmit}
      shape="circle"
      type="primary"
    />
  );
};

export default SenderBtn;
