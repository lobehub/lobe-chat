import { Checkbox } from 'antd';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';

const ToolItem = memo<{ identifier: string; label: string }>(({ identifier, label }) => {
  const [checked, togglePlugin] = useSessionStore((s) => [
    agentSelectors.currentAgentPlugins(s).includes(identifier),
    s.togglePlugin,
  ]);

  return (
    <Flexbox
      gap={40}
      horizontal
      justify={'space-between'}
      onClick={(e) => {
        e.stopPropagation();
        togglePlugin(identifier);
      }}
      padding={'8px 12px'}
    >
      {label}
      <Checkbox
        checked={checked}
        onClick={(e) => {
          e.stopPropagation();
          togglePlugin(identifier);
        }}
      />
    </Flexbox>
  );
});

export default ToolItem;
