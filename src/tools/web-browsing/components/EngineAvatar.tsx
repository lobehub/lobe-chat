import { Avatar } from 'antd';
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
    <Avatar.Group>
      {engines.map((engine, index) => (
        <Avatar
          key={engine}
          src={ENGINE_ICON_MAP[engine]}
          style={{
            background: theme.colorBgLayout,
            height: 20,
            padding: 3,
            width: 20,
            zIndex: 100 - index,
          }}
        />
      ))}
    </Avatar.Group>
  );
});
