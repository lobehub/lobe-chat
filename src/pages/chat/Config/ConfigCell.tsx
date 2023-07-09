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
    <Flexbox horizontal distribution={'space-between'} padding={'10px 12px'} className={styles.container}>
      <Flexbox horizontal gap={8}>
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
          key={label}
          horizontal
          distribution={'space-between'}
          padding={'10px 12px'}
          className={items.length === index + 1 ? undefined : styles.split}
        >
          <Flexbox horizontal gap={8}>
            <Icon icon={icon} />
            <Flexbox>{label}</Flexbox>
          </Flexbox>
          {value ?? <Icon icon={LucideChevronRight} />}
        </Flexbox>
      ))}
    </Flexbox>
  );
});
