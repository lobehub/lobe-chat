import { ArrowUp } from 'lucide-react-native';
import StopLoadingIcon from './StopLoadingIcon';
import { useChat } from '@/hooks/useChat';
import { Button } from '@/components';

const SenderBtn = () => {
  const { handleSubmit, isLoading, canSend, stopGenerating } = useChat();

  return isLoading ? (
    <Button icon={<StopLoadingIcon />} onPress={stopGenerating} shape="circle" />
  ) : (
    <Button
      disabled={!canSend}
      icon={<ArrowUp />}
      loading={!canSend}
      onPress={handleSubmit}
      shape="circle"
      type="primary"
    />
  );
};

export default SenderBtn;
