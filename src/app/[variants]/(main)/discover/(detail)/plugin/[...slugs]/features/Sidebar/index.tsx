import { ScrollShadow } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useQuery } from '@/hooks/useQuery';
import { PluginNavKey } from '@/types/discover';

import ActionButton from './ActionButton';
import Related from './Related';
import Summary from './Summary';

const Sidebar = memo<{ mobile?: boolean }>(({ mobile }) => {
  const { activeTab = PluginNavKey.Overview } = useQuery() as { activeTab: PluginNavKey };

  if (mobile) {
    return (
      <Flexbox gap={32}>
        <ActionButton />
      </Flexbox>
    );
  }

  return (
    <ScrollShadow
      flex={'none'}
      gap={32}
      hideScrollBar
      size={4}
      style={{
        maxHeight: 'calc(100vh - 76px)',
        paddingBottom: 24,
        position: 'sticky',
        top: 0,
      }}
      width={360}
    >
      <ActionButton />
      {activeTab !== PluginNavKey.Overview && <Summary />}
      {activeTab !== PluginNavKey.Related && <Related />}
    </ScrollShadow>
  );
});

export default Sidebar;
