import { ReactNode, memo } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

interface NavHeaderProps extends Omit<FlexboxProps, 'children'> {
  left?: ReactNode;
  right?: ReactNode;
}

const NavHeader = memo<NavHeaderProps>(({ left, right, ...rest }) => {
  return (
    <Flexbox
      align={'center'}
      gap={4}
      height={44}
      horizontal
      justify={'space-between'}
      padding={8}
      {...rest}
    >
      <Flexbox align={'center'} flex={1} gap={2} horizontal justify={'flex-start'}>
        {left}
      </Flexbox>
      <Flexbox align={'center'} gap={2} horizontal justify={'flex-end'}>
        {right}
      </Flexbox>
    </Flexbox>
  );
});

export default NavHeader;
