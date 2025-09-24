import { ArrowUp } from 'lucide-react-native';
import StopLoadingButton from './StopLoadingButton';
import { useChat } from '@/hooks/useChat';
import { Button } from '@/components';

const SenderBtn = () => {
  const { handleSubmit, isLoading, canSend, stopGenerating } = useChat();

  return isLoading ? (
    <StopLoadingButton onPress={stopGenerating} />
  ) : (
    <Button
      icon={<ArrowUp />}
      loading={!canSend}
      onPress={handleSubmit}
      shape="circle"
      type="primary"
    />
  );
};

export default SenderBtn;
