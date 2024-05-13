import { Icon, IconProps } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ChevronRight } from 'lucide-react';
import { ReactNode, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import Divider from './Divider';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    position: relative;
    font-size: 15px;
    border-radius: 0;

    &:active {
      background: ${token.colorFillTertiary};
    }
  `,
}));

export interface CellProps {
  icon?: IconProps['icon'];
  key?: string | number;
  label?: string | ReactNode;
  onClick?: () => void;
  type?: 'divider';
}

const Cell = memo<CellProps>(({ label, icon, onClick, type }) => {
  const { cx, styles, theme } = useStyles();

  if (type === 'divider') return <Divider />;

  return (
    <Flexbox
      align={'center'}
      className={cx(styles.container)}
      gap={12}
      horizontal
      justify={'space-between'}
      onClick={onClick}
      padding={16}
    >
      <Flexbox align={'center'} gap={12} horizontal>
        {icon && <Icon color={theme.colorPrimaryBorder} icon={icon} size={{ fontSize: 20 }} />}
        {label}
      </Flexbox>
      <Icon color={theme.colorBorder} icon={ChevronRight} size={{ fontSize: 16 }} />
    </Flexbox>
  );
});

export default Cell;
