import { Slider } from 'antd';
import { memo, useCallback } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useAgentStore } from '@/store/agent';
import { agentChatConfigSelectors } from '@/store/agent/selectors';

const TextVerbositySlider = memo(() => {
  const [config, updateAgentChatConfig] = useAgentStore((s) => [
    agentChatConfigSelectors.currentChatConfig(s),
    s.updateAgentChatConfig,
  ]);

  const textVerbosity = config.textVerbosity || 'medium'; // Default to 'medium' if not set

  const marks = {
    0: 'low',
    1: 'medium',
    2: 'high',
  };

  const verbosityValues = ['low', 'medium', 'high'];
  const indexValue = verbosityValues.indexOf(textVerbosity);
  const currentValue = indexValue === -1 ? 1 : indexValue;

  const updateTextVerbosity = useCallback(
    (value: number) => {
      const verbosity = verbosityValues[value] as 'low' | 'medium' | 'high';
      updateAgentChatConfig({ textVerbosity: verbosity });
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
          onChange={updateTextVerbosity}
          step={1}
          tooltip={{ open: false }}
          value={currentValue}
        />
      </Flexbox>
    </Flexbox>
  );
});

export default TextVerbositySlider;
