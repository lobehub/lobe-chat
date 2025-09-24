import { ArrowUp } from 'lucide-react-native';

import { Button } from '@/components';
import { useChat } from '@/hooks/useChat';

import StopLoadingButton from './StopLoadingButton';

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
