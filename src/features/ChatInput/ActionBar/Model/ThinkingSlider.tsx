import { Slider } from 'antd';
import { memo, useCallback } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors } from '@/store/agent/selectors';

const ThinkingSlider = memo(() => {
  const [config, updateAgentChatConfig] = useAgentStore((s) => [
    agentChatConfigSelectors.currentChatConfig(s),
    s.updateAgentChatConfig,
  ]);

  const thinking = config.thinking || 'auto'; // Default to 'auto' if not set

  const marks = {
    0: 'OFF',
    1: 'Auto',
    2: 'ON',
  };

  const thinkingValues = ['disabled', 'auto', 'enabled'];
  const indexValue = thinkingValues.indexOf(thinking);
  const currentValue = indexValue === -1 ? 1 : indexValue;

  const updateThinking = useCallback(
    (value: number) => {
      const thinkingMode = thinkingValues[value] as 'disabled' | 'auto' | 'enabled';
      updateAgentChatConfig({ thinking: thinkingMode });
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
          onChange={updateThinking}
          step={1}
          tooltip={{ open: false }}
          value={currentValue}
        />
      </Flexbox>
    </Flexbox>
  );
});

export default ThinkingSlider;
