import { Icon } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { FolderIcon } from 'lucide-react';
import { memo } from 'react';

interface LibIconProps {
  size?: number;
}
const LibIcon = memo<LibIconProps>(({ size = 20 }) => {
  const theme = useTheme();

  return <Icon color={theme.geekblue} fill={theme.geekblue3} icon={FolderIcon} size={size} />;
});

export default LibIcon;
