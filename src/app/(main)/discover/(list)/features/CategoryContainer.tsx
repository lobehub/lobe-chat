import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const CategoryContainer = memo<PropsWithChildren>(({ children }) => {
  return (
    <Flexbox
      as={'aside'}
      flex={'none'}
      height={'calc(100vh - 132px)'}
      style={{ overflowX: 'hidden', overflowY: 'hidden', position: 'sticky', top: 64 }}
      width={220}
    >
      {children}
    </Flexbox>
  );
});

export default CategoryContainer;
