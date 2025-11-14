import { Slider } from 'antd';
import { memo, useCallback } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors } from '@/store/agent/selectors';

const GPT51ReasoningEffortSlider = memo(() => {
  const [config, updateAgentChatConfig] = useAgentStore((s) => [
    agentChatConfigSelectors.currentChatConfig(s),
    s.updateAgentChatConfig,
  ]);

  const gpt5_1ReasoningEffort = config.gpt5_1ReasoningEffort || 'none'; // Default to 'none' if not set

  const marks = {
    0: 'none',
    1: 'low',
    2: 'medium',
    3: 'high',
  };

  const effortValues = ['none', 'low', 'medium', 'high'];
  const indexValue = effortValues.indexOf(gpt5_1ReasoningEffort);
  const currentValue = indexValue === -1 ? 0 : indexValue;

  const updateGPT51ReasoningEffort = useCallback(
    (value: number) => {
      const effort = effortValues[value] as 'none' | 'low' | 'medium' | 'high';
      updateAgentChatConfig({ gpt5_1ReasoningEffort: effort });
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
          max={3}
          min={0}
          onChange={updateGPT51ReasoningEffort}
          step={1}
          tooltip={{ open: false }}
          value={currentValue}
        />
      </Flexbox>
    </Flexbox>
  );
});

export default GPT51ReasoningEffortSlider;
