import { Icon } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { Loader2, LucideIcon } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const TimeLabel = memo<{
  date?: string;
  icon: LucideIcon;
  title: string;
}>(({ date, icon, title }) => {
  const theme = useTheme();
  return (
    <Flexbox
      align={'center'}
      gap={4}
      horizontal
      style={{
        color: theme.colorTextDescription,
        fontSize: 12,
      }}
    >
      <Icon icon={icon} />
      {title}:{' '}
      {date ? <span style={{ fontWeight: 'bold' }}>{date}</span> : <Icon icon={Loader2} spin />}
    </Flexbox>
  );
});

export default TimeLabel;
