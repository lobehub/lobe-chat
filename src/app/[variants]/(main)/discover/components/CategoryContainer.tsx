import { ScrollShadow } from '@lobehub/ui';
import { PropsWithChildren, memo } from 'react';

const CategoryContainer = memo<PropsWithChildren<{ top?: number }>>(({ children, top = 64 }) => {
  return (
    <ScrollShadow
      as={'aside'}
      flex={'none'}
      height={`calc(100vh - ${top * 2 + 4}px)`}
      hideScrollBar
      size={4}
      style={{ paddingBottom: 16, position: 'sticky', top }}
      width={220}
    >
      {children}
    </ScrollShadow>
  );
});

export default CategoryContainer;
