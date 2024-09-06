import { memo } from 'react';

import Select from '@/features/ModelSelect';

import { useStore } from '../store';

const ModelSelect = memo(() => {
  const [model, updateConfig] = useStore((s) => [s.config.model, s.setAgentConfig]);

  return (
    <Select
      onChange={(props) => {
        updateConfig(props);
      }}
      value={model}
    />
  );
});

export default ModelSelect;
