import { memo } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

const SidebarContainer = memo<FlexboxProps>(({ children, style, ...rest }) => {
  return (
    <Flexbox
      flex={'none'}
      gap={48}
      height={'100%'}
      style={{ position: 'relative', width: 320, ...style }}
      width={'100%'}
      {...rest}
    >
      {children}
    </Flexbox>
  );
});

export default SidebarContainer;
