import { Slider } from 'antd';
import { memo, useCallback } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors } from '@/store/agent/selectors';

const GPT52ReasoningEffortSlider = memo(() => {
  const [config, updateAgentChatConfig] = useAgentStore((s) => [
    agentChatConfigSelectors.currentChatConfig(s),
    s.updateAgentChatConfig,
  ]);

  const gpt5_2ReasoningEffort = config.gpt5_2ReasoningEffort || 'none'; // Default to 'none' if not set

  const marks = {
    0: 'none',
    1: 'low',
    2: 'med',
    3: 'high',
    4: 'xhigh',
  };

  const effortValues = ['none', 'low', 'medium', 'high', 'xhigh'];
  const indexValue = effortValues.indexOf(gpt5_2ReasoningEffort);
  const currentValue = indexValue === -1 ? 0 : indexValue;

  const updateGPT52ReasoningEffort = useCallback(
    (value: number) => {
      const effort = effortValues[value] as 'none' | 'low' | 'medium' | 'high' | 'xhigh';
      updateAgentChatConfig({ gpt5_2ReasoningEffort: effort });
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
          max={4}
          min={0}
          onChange={updateGPT52ReasoningEffort}
          step={1}
          tooltip={{ open: false }}
          value={currentValue}
        />
      </Flexbox>
    </Flexbox>
  );
});

export default GPT52ReasoningEffortSlider;
