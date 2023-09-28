import { useResponsive } from 'antd-style';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

interface MobilePaddingProps {
  bottom?: number;
  children: ReactNode;
  gap?: number;
  left?: number;
  right?: number;
  top?: number;
}

const MobilePadding = memo<MobilePaddingProps>(
  ({ children, top = 16, right = 16, left = 16, bottom = 16, gap }) => {
    const { mobile } = useResponsive();

    if (mobile)
      return (
        <Flexbox
          gap={gap}
          style={{ paddingBottom: bottom, paddingLeft: left, paddingRight: right, paddingTop: top }}
        >
          {children}
        </Flexbox>
      );

    return children;
  },
);

export default MobilePadding;
