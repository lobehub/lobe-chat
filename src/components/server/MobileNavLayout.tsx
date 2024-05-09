import { ReactNode } from 'react';
import { Flexbox, type FlexboxProps } from 'react-layout-kit';

interface MobileContentLayoutProps extends FlexboxProps {
  header?: ReactNode;
  withNav?: boolean;
}

const MobileContentLayout = ({
  children,
  withNav,
  style,
  header,
  ...rest
}: MobileContentLayoutProps) => {
  const content = (
    <Flexbox
      height="100%"
      style={{
        overflowX: 'hidden',
        overflowY: 'auto',
        position: 'relative',
        ...style,
        // TabNav Height
        paddingBottom: withNav ? 48 : style?.paddingBottom,
      }}
      width="100%"
      {...rest}
    >
      {children}
    </Flexbox>
  );

  if (!header) return content;

  return (
    <Flexbox height={'100%'} style={{ overflow: 'hidden', position: 'relative' }} width={'100%'}>
      {header}
      <Flexbox
        height="100%"
        id={'lobe-mobile-scroll-container'}
        style={{
          overflowX: 'hidden',
          overflowY: 'auto',
          position: 'relative',
          ...style,
          // TabNav Height
          paddingBottom: withNav ? 48 : style?.paddingBottom,
        }}
        width="100%"
        {...rest}
      >
        {children}
      </Flexbox>
    </Flexbox>
  );
};

MobileContentLayout.displayName = 'MobileContentLayout';

export default MobileContentLayout;
