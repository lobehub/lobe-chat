import { useTheme } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

interface TotalCardProps {
  count: string | number;
  title: string;
}

const TotalCard = memo<TotalCardProps>(({ title, count }) => {
  const theme = useTheme();
  return (
    <Flexbox
      padding={12}
      style={{
        background: theme.isDarkMode ? theme.colorFillTertiary : theme.colorFillQuaternary,
        borderRadius: theme.borderRadiusLG,
      }}
    >
      <div
        style={{
          fontSize: 13,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 'bold',
        }}
      >
        {count}
      </div>
    </Flexbox>
  );
});

export default TotalCard;
