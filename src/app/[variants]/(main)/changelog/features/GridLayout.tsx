import { FC, PropsWithChildren, ReactNode } from 'react';
import { Flexbox } from 'react-layout-kit';

const GridLayout: FC<PropsWithChildren<{ date?: ReactNode; mobile?: boolean }>> = ({
  mobile,
  children,
  date,
}) => {
  return (
    <Flexbox horizontal={!mobile} wrap={'wrap'}>
      <Flexbox flex={1} style={{ minWidth: 150, position: 'relative' }}>
        {date}
      </Flexbox>
      <Flexbox flex={3} gap={16} style={{ minWidth: 'min(600px, 100%)', position: 'relative' }}>
        {children}
      </Flexbox>
      {!mobile && <Flexbox flex={1} style={{ minWidth: 150, position: 'relative' }} />}
    </Flexbox>
  );
};

export default GridLayout;
