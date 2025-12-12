import { Slider } from 'antd';
import { memo, useCallback } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors } from '@/store/agent/selectors';

const GPT52ProReasoningEffortSlider = memo(() => {
  const [config, updateAgentChatConfig] = useAgentStore((s) => [
    agentChatConfigSelectors.currentChatConfig(s),
    s.updateAgentChatConfig,
  ]);

  const gpt5_2ProReasoningEffort = config.gpt5_2ProReasoningEffort || 'medium'; // Default to 'medium' if not set

  const marks = {
    0: 'medium',
    1: 'high',
    2: 'xhigh',
  };

  const effortValues = ['medium', 'high', 'xhigh'];
  const indexValue = effortValues.indexOf(gpt5_2ProReasoningEffort);
  const currentValue = indexValue === -1 ? 0 : indexValue;

  const updateGPT52ProReasoningEffort = useCallback(
    (value: number) => {
      const effort = effortValues[value] as 'medium' | 'high' | 'xhigh';
      updateAgentChatConfig({ gpt5_2ProReasoningEffort: effort });
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
          onChange={updateGPT52ProReasoningEffort}
          step={1}
          tooltip={{ open: false }}
          value={currentValue}
        />
      </Flexbox>
    </Flexbox>
  );
});

export default GPT52ProReasoningEffortSlider;
