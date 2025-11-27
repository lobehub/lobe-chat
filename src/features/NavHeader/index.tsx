import { CSSProperties, ReactNode, memo } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

import TogglePanelButton from '@/features/NavPanel/components/TogglePanelButton';
import { useNavPanel } from '@/features/NavPanel/hooks/useNavPanel';

interface NavHeaderProps extends Omit<FlexboxProps, 'children'> {
  children?: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
  styles?: {
    center?: CSSProperties;
    left?: CSSProperties;
    right?: CSSProperties;
  };
}

const NavHeader = memo<NavHeaderProps>(({ style, children, left, right, styles, ...rest }) => {
  const { expand } = useNavPanel();
  const noContent = !left && !right;

  if (noContent && expand) return;

  return (
    <Flexbox
      align={'center'}
      flex={'none'}
      gap={4}
      height={44}
      horizontal
      justify={'space-between'}
      padding={8}
      style={style}
      {...rest}
    >
      <Flexbox align={'center'} gap={2} horizontal justify={'flex-start'} style={styles?.left}>
        {!expand && <TogglePanelButton />}
        {left}
      </Flexbox>
      {children && (
        <Flexbox flex={1} style={styles?.center}>
          {children}
        </Flexbox>
      )}
      <Flexbox align={'center'} gap={2} horizontal justify={'flex-end'} style={styles?.right}>
        {right}
      </Flexbox>
    </Flexbox>
  );
});

export default NavHeader;
