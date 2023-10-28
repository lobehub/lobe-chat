import { Icon, List } from '@lobehub/ui';
import { createStyles, useResponsive } from 'antd-style';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { CSSProperties, ReactNode, memo } from 'react';

const { Item } = List;

const useStyles = createStyles(({ css, token, responsive }) => ({
  container: css`
    position: relative;
    padding-top: 20px;
    padding-bottom: 20px;
    border-radius: ${token.borderRadius}px;
    ${responsive.mobile} {
      border-radius: 0;
    }
  `,
}));

export interface ItemProps {
  active?: boolean;
  className?: string;
  icon: LucideIcon;
  label: ReactNode;
  style?: CSSProperties;
}

const SettingItem = memo<ItemProps>(({ label, icon, active = false, style, className }) => {
  const { cx, styles } = useStyles();
  const { mobile } = useResponsive();
  return (
    <Item
      active={active}
      avatar={<Icon icon={icon} size={{ fontSize: 16 }} />}
      className={cx(styles.container, className)}
      style={style}
      title={label as string}
    >
      {mobile && <Icon icon={ChevronRight} size={{ fontSize: 16 }} />}
    </Item>
  );
});

export default SettingItem;
