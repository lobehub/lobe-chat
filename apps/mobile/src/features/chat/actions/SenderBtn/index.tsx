import { Button } from '@lobehub/ui-rn';
import { ArrowUp } from 'lucide-react-native';

import { useChat } from '@/hooks/useChat';

import StopLoadingButton from './StopLoadingButton';

const SenderBtn = () => {
  const { handleSubmit, isLoading, isGenerating, canSend, stopGenerating } = useChat();

  return isLoading ? (
    <StopLoadingButton onPress={stopGenerating} size={'small'} />
  ) : (
    <Button
      icon={ArrowUp}
      loading={isGenerating || !canSend}
      onPress={handleSubmit}
      shape="circle"
      size={'small'}
      type="primary"
    />
  );
};

export default SenderBtn;
