import { MCP } from '@lobehub/icons';
import { Avatar } from '@lobehub/ui';
import { CSSProperties, memo } from 'react';

interface PluginAvatarProps {
  alt?: string;
  avatar?: string;
  size?: number;
  style?: CSSProperties;
}

const PluginAvatar = memo<PluginAvatarProps>(({ avatar, style, size, alt }) => {
  return avatar === 'MCP_AVATAR' ? (
    <MCP.Avatar size={size ? size * 0.8 : 36} />
  ) : (
    <Avatar
      alt={alt}
      avatar={avatar}
      size={size}
      style={{ flex: 'none', overflow: 'hidden', ...style }}
    />
  );
});

export default PluginAvatar;
