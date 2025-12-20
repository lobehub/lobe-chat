import { Avatar, Icon } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { LucideIcon } from 'lucide-react';
import { memo } from 'react';

interface ServerIconProps {
  icon: string | LucideIcon;
  label: string;
}

const ServerIcon = memo<ServerIconProps>(({ icon, label }) => {
  const theme = useTheme();

  if (typeof icon === 'string') {
    return <Avatar alt={label} avatar={icon} shape={'square'} size={24} style={{ flex: 'none' }} />;
  }

  return <Icon fill={theme.colorText} icon={icon} size={24} />;
});

ServerIcon.displayName = 'ServerIcon';

export default ServerIcon;
