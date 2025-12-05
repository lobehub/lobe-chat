import { Slider } from 'antd';
import { memo, useCallback } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors } from '@/store/agent/selectors';

const CodexMaxReasoningEffortSlider = memo(() => {
  const [config, updateAgentChatConfig] = useAgentStore((s) => [
    agentChatConfigSelectors.currentChatConfig(s),
    s.updateAgentChatConfig,
  ]);

  const codexMaxReasoningEffort = config.codexMaxReasoningEffort || 'medium'; // Default to 'medium' if not set

  const marks = {
    0: 'low',
    1: 'medium',
    2: 'high',
    3: 'xhigh',
  };

  const effortValues = ['low', 'medium', 'high', 'xhigh'];
  const indexValue = effortValues.indexOf(codexMaxReasoningEffort);
  const currentValue = indexValue === -1 ? 1 : indexValue;

  const updateCodexMaxReasoningEffort = useCallback(
    (value: number) => {
      const effort = effortValues[value] as 'low' | 'medium' | 'high' | 'xhigh';
      updateAgentChatConfig({ codexMaxReasoningEffort: effort });
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
          onChange={updateCodexMaxReasoningEffort}
          step={1}
          tooltip={{ open: false }}
          value={currentValue}
        />
      </Flexbox>
    </Flexbox>
  );
});

export default CodexMaxReasoningEffortSlider;
