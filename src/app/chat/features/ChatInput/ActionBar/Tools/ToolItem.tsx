import { Checkbox } from 'antd';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/slices/agent';

const ToolItem = memo<{ identifier: string; label: string }>(({ identifier, label }) => {
  const checked = useSessionStore((s) =>
    agentSelectors.currentAgentPlugins(s).includes(identifier),
  );

  return (
    <Flexbox
      gap={40}
      horizontal
      justify={'space-between'}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {label}
      <Checkbox
        checked={checked}
        onClick={(e) => {
          console.log(identifier);
          e.stopPropagation();
        }}
      />
    </Flexbox>
  );
});

export default ToolItem;
