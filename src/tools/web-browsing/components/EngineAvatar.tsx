import { Avatar } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { memo } from 'react';

import { ENGINE_ICON_MAP } from '../const';

interface EngineAvatarGroupProps {
  engines: string[];
}

interface EngineAvatarProps {
  engine: string;
  size?: number;
}
export const EngineAvatar = memo<EngineAvatarProps>(({ engine }) => (
  <Avatar alt={engine} src={ENGINE_ICON_MAP[engine]} style={{ height: 16, width: 16 }} />
));

export const EngineAvatarGroup = memo<EngineAvatarGroupProps>(({ engines }) => {
  const theme = useTheme();
  return (
    <Avatar.Group
      items={engines.map((engine) => ({
        avatar: ENGINE_ICON_MAP[engine],
        background: theme.colorBgLayout,
        key: engine,
        title: engine,
      }))}
      size={20}
    />
  );
});
