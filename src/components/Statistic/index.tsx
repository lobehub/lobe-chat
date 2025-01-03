import { useTheme } from 'antd-style';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const Statistic = memo<{ title: ReactNode; value: ReactNode }>(({ value, title }) => {
  const theme = useTheme();
  return (
    <Flexbox gap={4} horizontal style={{ color: theme.colorTextSecondary, fontSize: 12 }}>
      <span style={{ fontWeight: 'bold' }}>{value}</span>
      <span>{title}</span>
    </Flexbox>
  );
});

export default Statistic;
