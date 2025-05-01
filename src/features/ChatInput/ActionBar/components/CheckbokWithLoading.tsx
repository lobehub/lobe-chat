import { Icon } from '@lobehub/ui';
import { Checkbox } from 'antd';
import { Loader2 } from 'lucide-react';
import { ReactNode, memo, useState } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

export interface CheckboxItemProps {
  checked?: boolean;
  id: string;
  label?: ReactNode;
  onUpdate: (id: string, enabled: boolean) => Promise<void>;
}

const CheckboxItem = memo<CheckboxItemProps>(({ id, onUpdate, label, checked }) => {
  const [loading, setLoading] = useState(false);

  const updateState = async () => {
    setLoading(true);
    await onUpdate(id, !checked);
    setLoading(false);
  };

  return (
    <Flexbox
      gap={24}
      horizontal
      justify={'space-between'}
      onClick={async (e) => {
        e.stopPropagation();
        updateState();
      }}
      style={{
        paddingLeft: 8,
      }}
    >
      {label || id}
      {loading ? (
        <Center width={18}>
          <Icon icon={Loader2} spin />
        </Center>
      ) : (
        <Checkbox
          checked={checked}
          onClick={async (e) => {
            e.stopPropagation();
            await updateState();
          }}
        />
      )}
    </Flexbox>
  );
});

export default CheckboxItem;
