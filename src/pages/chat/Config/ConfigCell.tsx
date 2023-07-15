import { Icon } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { LucideChevronRight, LucideIcon } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    background: ${token.colorFillQuaternary};
    border-radius: 6px;
  `,
  split: css`
    border-bottom: 1px solid ${token.colorSplit};
  `,
}));
export interface ConfigItem {
  icon: LucideIcon;
  label: string;
  value?: string | number;
}

export type ConfigCellProps = ConfigItem;

export const ConfigCell = memo<ConfigCellProps>(({ icon, label, value }) => {
  const { styles } = useStyles();
  return (
    <Flexbox
      className={styles.container}
      distribution={'space-between'}
      horizontal
      padding={'10px 12px'}
    >
      <Flexbox gap={8} horizontal>
        <Icon icon={icon} />
        <Flexbox>{label}</Flexbox>
      </Flexbox>
      {value ?? <Icon icon={LucideChevronRight} />}
    </Flexbox>
  );
});

export interface CellGroupProps {
  items: ConfigItem[];
}

export const ConfigCellGroup = memo<CellGroupProps>(({ items }) => {
  const { styles } = useStyles();

  return (
    <Flexbox className={styles.container}>
      {items.map(({ label, icon, value }, index) => (
        <Flexbox
          className={items.length === index + 1 ? undefined : styles.split}
          distribution={'space-between'}
          horizontal
          key={label}
          padding={'10px 12px'}
        >
          <Flexbox gap={8} horizontal>
            <Icon icon={icon} />
            <Flexbox>{label}</Flexbox>
          </Flexbox>
          {value ?? <Icon icon={LucideChevronRight} />}
        </Flexbox>
      ))}
    </Flexbox>
  );
});
