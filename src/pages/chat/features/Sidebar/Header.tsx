import { type ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

interface HeaderProps {
  actions?: ReactNode;
  title: string;
}

const Header = memo<HeaderProps>(({ title, actions }) => {
  return (
    <Flexbox
      align={'center'}
      distribution={'space-between'}
      horizontal
      padding={12}
      paddingInline={16}
    >
      <Flexbox>{title}</Flexbox>
      <Flexbox gap={4} horizontal>
        {actions}
      </Flexbox>
    </Flexbox>
  );
});

export default Header;
