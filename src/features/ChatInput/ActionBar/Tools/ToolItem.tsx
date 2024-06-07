import { Checkbox } from 'antd';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import PluginTag from '@/features/PluginStore/PluginItem/PluginTag';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useToolStore } from '@/store/tool';
import { customPluginSelectors } from '@/store/tool/selectors';

const ToolItem = memo<{ identifier: string; label: string }>(({ identifier, label }) => {
  const [checked, togglePlugin] = useAgentStore((s) => [
    agentSelectors.currentAgentPlugins(s).includes(identifier),
    s.togglePlugin,
  ]);

  const isCustom = useToolStore((s) => customPluginSelectors.isCustomPlugin(identifier)(s));

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
      <Flexbox align={'center'} gap={8} horizontal>
        {label}
        {isCustom && <PluginTag showText={false} type={'customPlugin'} />}
      </Flexbox>
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
