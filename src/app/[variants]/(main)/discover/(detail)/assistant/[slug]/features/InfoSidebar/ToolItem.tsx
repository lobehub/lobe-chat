import { Avatar } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { DiscoverPlugintem } from '@/types/discover';

const ToolItem = memo<DiscoverPlugintem>(({ meta }) => {
  const theme = useTheme();

  return (
    <Flexbox align={'center'} gap={12} horizontal>
      <Avatar avatar={meta?.avatar || '🧩'} background={theme.colorFillTertiary} size={36} />
      <span style={{ fontSize: 16, fontWeight: 500 }}>{meta?.title}</span>
    </Flexbox>
  );
});

export default ToolItem;
