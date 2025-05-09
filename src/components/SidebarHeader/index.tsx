import { createStyles } from 'antd-style';
import { type ReactNode, memo } from 'react';
import { Flexbox, FlexboxProps } from 'react-layout-kit';

const useStyles = createStyles(({ css }) => ({
  header: css`
    z-index: 10;
  `,
}));

interface SidebarHeaderProps extends Omit<FlexboxProps, 'title'> {
  actions?: ReactNode;
  onClick?: () => void;
  title: ReactNode;
}

const SidebarHeader = memo<SidebarHeaderProps>(({ title, style, actions, onClick, ...rest }) => {
  const { styles } = useStyles();

  return (
    <Flexbox
      align={'center'}
      className={styles.header}
      distribution={'space-between'}
      horizontal
      onClick={onClick}
      paddingBlock={14}
      paddingInline={16}
      style={style}
      {...rest}
    >
      <Flexbox align={'center'} gap={4} horizontal width={'100%'}>
        {title}
      </Flexbox>
      <Flexbox align={'center'} gap={2} horizontal>
        {actions}
      </Flexbox>
    </Flexbox>
  );
});

export default SidebarHeader;
