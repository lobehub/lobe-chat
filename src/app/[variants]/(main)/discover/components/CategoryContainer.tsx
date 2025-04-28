import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const CategoryContainer = memo<PropsWithChildren<{ top?: number }>>(({ children, top = 52 }) => {
  return (
    <Flexbox
      as={'aside'}
      flex={'none'}
      height={`calc(100vh - ${top * 2 + 4}px)`}
      style={{ overflowX: 'hidden', overflowY: 'hidden', position: 'sticky', top }}
      width={220}
    >
      {children}
    </Flexbox>
  );
});

export default CategoryContainer;
