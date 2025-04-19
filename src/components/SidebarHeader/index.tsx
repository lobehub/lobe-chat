import { createStyles } from 'antd-style';
import { CSSProperties, type ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css }) => ({
  header: css`
    z-index: 10;
  `,
}));

interface SidebarHeaderProps {
  actions?: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
  title: ReactNode;
}

const SidebarHeader = memo<SidebarHeaderProps>(({ title, style, actions, onClick }) => {
  const { styles } = useStyles();

  return (
    <Flexbox
      align={'center'}
      className={styles.header}
      distribution={'space-between'}
      horizontal
      onClick={onClick}
      padding={14}
      paddingInline={16}
      style={style}
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
