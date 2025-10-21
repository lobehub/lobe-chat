import { Slider } from 'antd';
import { memo, useCallback } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors } from '@/store/agent/selectors';

const SearchContextSizeSlider = memo(() => {
  const [config, updateAgentChatConfig] = useAgentStore((s) => [
    agentChatConfigSelectors.currentChatConfig(s),
    s.updateAgentChatConfig,
  ]);

  const searchContextSize = config.searchContextSize || 'medium'; // Default to 'medium' if not set

  const marks = {
    0: 'low',
    1: 'medium',
    2: 'high',
  };

  const sizeValues = ['low', 'medium', 'high'];
  const indexValue = sizeValues.indexOf(searchContextSize);
  const currentValue = indexValue === -1 ? 1 : indexValue;

  const updateSearchContextSize = useCallback(
    (value: number) => {
      const size = sizeValues[value] as 'low' | 'medium' | 'high';
      updateAgentChatConfig({ searchContextSize: size });
    },
    [updateAgentChatConfig],
  );

  return (
    <Flexbox
      align={'center'}
      gap={12}
      horizontal
      paddingInline={'0 20px'}
      style={{ minWidth: 200, width: '100%' }}
    >
      <Flexbox flex={1}>
        <Slider
          marks={marks}
          max={2}
          min={0}
          onChange={updateSearchContextSize}
          step={1}
          tooltip={{ open: false }}
          value={currentValue}
        />
      </Flexbox>
    </Flexbox>
  );
});

export default SearchContextSizeSlider;