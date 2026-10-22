import { Accordion } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import { media } from '@lobehub/ui/stylex/media.stylex';
import * as stylex from '@stylexjs/stylex';
import { type ReactNode } from 'react';
import { memo } from 'react';

const styles = stylex.create({
  header: {
    borderRadius: { default: cssVar.borderRadius, [media.sm]: '0' },
    color: { 'default': cssVar.colorTextDescription, ':hover': cssVar.colorText },
    backgroundColor: { 'default': null, ':hover': cssVar.colorFillTertiary },
    backgroundImage: { 'default': null, ':hover': 'none' },
  },
});

export interface CollapseGroupItem {
  children: ReactNode;
  extra?: ReactNode;
  key: string;
  label: ReactNode;
}

interface CollapseGroupProps {
  activeKey?: string[];
  items: CollapseGroupItem[];
  onChange?: (keys: string[]) => void;
}

const CollapseGroup = memo<CollapseGroupProps>(({ activeKey, items, onChange }) => {
  return (
    <Accordion
      classNames={{ header: stylex.props(styles.header).className }}
      indicatorPlacement={'end'}
      styles={{ trigger: { paddingInline: '16px 10px' } }}
      value={activeKey}
      items={items.map((item) => ({
        action: item.extra,
        children: item.children,
        key: item.key,
        title: item.label,
      }))}
      onValueChange={onChange}
    />
  );
});

export default CollapseGroup;
