import { Block, Text } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import PluginAvatar from '@/components/Plugins/PluginAvatar';
import { DiscoverMcpItem } from '@/types/discover';
import { LobeToolType } from '@/types/tool/tool';

interface PluginItemProps extends DiscoverMcpItem {
  active?: boolean;
  onClick?: () => void;
  type?: LobeToolType;
}
const Item = memo<PluginItemProps>(({ name, description, icon, onClick, active }) => {
  return (
    <Block
      align={'center'}
      clickable
      gap={8}
      horizontal
      justify={'space-between'}
      onClick={onClick}
      paddingBlock={8}
      paddingInline={12}
      style={{ position: 'relative' }}
      variant={active ? 'filled' : 'borderless'}
    >
      <Flexbox
        align={'center'}
        flex={1}
        gap={8}
        horizontal
        style={{ overflow: 'hidden', position: 'relative' }}
      >
        <PluginAvatar avatar={icon} />
        <Flexbox flex={1} gap={4} style={{ overflow: 'hidden', position: 'relative' }}>
          <Text ellipsis strong>
            {name}
          </Text>
          <Text ellipsis fontSize={12} type={'secondary'}>
            {description}
          </Text>
        </Flexbox>
      </Flexbox>
    </Block>
  );
});

export default Item;
