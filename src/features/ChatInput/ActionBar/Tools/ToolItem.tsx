import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import PluginTag from '@/features/PluginStore/PluginItem/PluginTag';
import { useToolStore } from '@/store/tool';
import { customPluginSelectors } from '@/store/tool/selectors';

const ToolItem = memo<{ identifier: string; label?: string }>(({ identifier, label }) => {
  const isCustom = useToolStore((s) => customPluginSelectors.isCustomPlugin(identifier)(s));

  return (
    <Flexbox align={'center'} gap={8} horizontal>
      {label || identifier}
      {isCustom && <PluginTag showText={false} type={'customPlugin'} />}
    </Flexbox>
  );
});

export default ToolItem;
