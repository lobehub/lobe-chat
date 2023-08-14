import { createStyles } from 'antd-style';
import { type ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(
  ({ css, token }) => css`
    z-index: 10;
    box-shadow: 0 2px 8px ${token.colorBgLayout};
  `,
);

interface HeaderProps {
  actions?: ReactNode;
  title: string;
}

const Header = memo<HeaderProps>(({ title, actions }) => {
  const { styles } = useStyles();
  return (
    <Flexbox
      align={'center'}
      className={styles}
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
