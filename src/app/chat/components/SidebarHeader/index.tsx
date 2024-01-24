import { createStyles } from 'antd-style';
import { type ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  header: css`
    z-index: 10;
    box-shadow: 0 2px 6px ${token.colorBgLayout};
  `,
}));

interface SidebarHeaderProps {
  actions?: ReactNode;
  title: ReactNode;
}

const SidebarHeader = memo<SidebarHeaderProps>(({ title, actions }) => {
  const { styles } = useStyles();

  return (
    <Flexbox
      align={'center'}
      className={styles.header}
      distribution={'space-between'}
      horizontal
      padding={14}
      paddingInline={16}
    >
      <Flexbox align={'center'} gap={4} horizontal>
        {title}
      </Flexbox>
      <Flexbox align={'center'} gap={2} horizontal>
        {actions}
      </Flexbox>
    </Flexbox>
  );
});

export default SidebarHeader;
