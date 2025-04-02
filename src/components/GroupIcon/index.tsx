import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { LucideIcon } from 'lucide-react';
import { memo } from 'react';
import { Center } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  icon: css`
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: 8px;
    background: ${token.colorBgElevated};
  `,
}));

const GroupIcon = memo<{ icon: LucideIcon }>(({ icon }) => {
  const { styles } = useStyles();

  return (
    <Center className={styles.icon} flex={'none'} height={40} width={40}>
      <Icon icon={icon} size={{ fontSize: 24 }} />
    </Center>
  );
});

export default GroupIcon;
