import { ScrollShadow } from '@lobehub/ui';
import { FC, PropsWithChildren } from 'react';

const CategoryContainer: FC<PropsWithChildren<{ top?: number }>> = ({ children, top = 16 }) => {
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
};

export default CategoryContainer;
