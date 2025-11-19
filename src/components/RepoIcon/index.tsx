import { Icon } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { BoxIcon } from 'lucide-react';
import { memo } from 'react';

interface RepoIconProps {
  size?: number;
}
const RepoIcon = memo<RepoIconProps>(({ size = 20 }) => {
  const theme = useTheme();

  return <Icon color={theme.geekblue} fill={theme.geekblue3} icon={BoxIcon} size={size} />;
});

export default RepoIcon;
