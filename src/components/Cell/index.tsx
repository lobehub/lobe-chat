import { Icon, List } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ChevronRight } from 'lucide-react';
import { ReactNode, memo } from 'react';

const { Item } = List;

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  container: css`
    position: relative;
    padding-block: 16px !important;
    background: ${isDarkMode ? token.colorBgLayout : token.colorBgContainer};
    border-radius: 0;
  `,
}));

export interface CellProps {
  icon: ReactNode;
  label: string | ReactNode;
  onClick?: () => void;
}

const Cell = memo<CellProps>(({ label, icon, onClick }) => {
  const { cx, styles } = useStyles();

  return (
    <Item
      active={false}
      avatar={icon}
      className={cx(styles.container)}
      onClick={onClick}
      title={label as string}
    >
      <Icon icon={ChevronRight} size={{ fontSize: 16 }} />
    </Item>
  );
});

export default Cell;
