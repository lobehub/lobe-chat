import { memo } from 'react';

import { SettingModelSelect } from '@/components/SettingModelSelect';
import { useEnabledChatModels } from '@/hooks/useEnabledChatModels';

interface ModelSelectProps {
  defaultValue?: { model: string; provider?: string };
  onChange?: (props: { model: string; provider: string }) => void;
  showAbility?: boolean;
  value?: { model: string; provider?: string };
}

const ModelSelect = memo<ModelSelectProps>((props) => {
  const enabledList = useEnabledChatModels();

  return <SettingModelSelect {...props} providers={enabledList} />;
});

export default ModelSelect;
