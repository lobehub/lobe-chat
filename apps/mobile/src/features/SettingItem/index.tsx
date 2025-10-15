import { Href, Link } from 'expo-router';
import { CheckIcon } from 'lucide-react-native';
import { ReactNode } from 'react';

import { Cell, CellProps, Flexbox, Switch } from '@/components';

interface SettingItemProps extends CellProps {
  customContent?: ReactNode;
  description?: string;
  href?: Href;
  isSelected?: boolean;
  loading?: boolean;
  onSwitchChange?: (value: boolean) => void;
  showCheckmark?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
}

const SettingItem = ({
  title,
  extra,
  href,
  showSwitch,
  switchValue,
  onSwitchChange,
  description,
  isSelected = false,
  showCheckmark = false,
  loading = false,
  customContent,
  ...rest
}: SettingItemProps) => {
  let node = (
    <Cell
      arrowIcon={isSelected ? CheckIcon : undefined}
      description={description}
      extra={showSwitch ? <Switch checked={switchValue} onChange={onSwitchChange} /> : extra}
      loading={loading}
      showArrow={!!href || (!showSwitch && showCheckmark && isSelected)}
      title={title}
      {...rest}
    />
  );
  if (customContent) {
    node = (
      <Flexbox>
        {node}
        {customContent}
      </Flexbox>
    );
  }

  if (href) {
    return (
      <Link asChild href={href}>
        {node}
      </Link>
    );
  }

  return node;
};

export default SettingItem;
