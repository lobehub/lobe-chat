import { Slider } from 'antd';
import { memo, useCallback } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors } from '@/store/agent/selectors';

const GPT5ReasoningEffortSlider = memo(() => {
  const [config, updateAgentChatConfig] = useAgentStore((s) => [
    agentChatConfigSelectors.currentChatConfig(s),
    s.updateAgentChatConfig,
  ]);

  const gpt5ReasoningEffort = config.gpt5ReasoningEffort || 'medium'; // Default to 'medium' if not set

  const marks = {
    0: 'minimal',
    1: 'low',
    2: 'medium',
    3: 'high',
  };

  const effortValues = ['minimal', 'low', 'medium', 'high'];
  const indexValue = effortValues.indexOf(gpt5ReasoningEffort);
  const currentValue = indexValue === -1 ? 2 : indexValue;

  const updateGPT5ReasoningEffort = useCallback(
    (value: number) => {
      const effort = effortValues[value] as 'minimal' | 'low' | 'medium' | 'high';
      updateAgentChatConfig({ gpt5ReasoningEffort: effort });
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
          onChange={updateGPT5ReasoningEffort}
          step={1}
          tooltip={{ open: false }}
          value={currentValue}
        />
      </Flexbox>
    </Flexbox>
  );
});

export default GPT5ReasoningEffortSlider;
