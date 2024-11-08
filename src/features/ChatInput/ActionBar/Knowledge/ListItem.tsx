import { Icon } from '@lobehub/ui';
import { Checkbox } from 'antd';
import { Loader2 } from 'lucide-react';
import { memo, useState } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

interface FileItemProps {
  enabled?: boolean;
  id: string;
  label: string;
  onUpdate: (id: string, enabled: boolean) => Promise<void>;
}

const ListItem = memo<FileItemProps>(({ id, onUpdate, label, enabled }) => {
  const [loading, setLoading] = useState(false);

  const updateState = async () => {
    setLoading(true);
    await onUpdate(id, !enabled);
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
      padding={'8px 12px'}
    >
      {label}
      {loading ? (
        <Center width={18}>
          <Icon icon={Loader2} spin />
        </Center>
      ) : (
        <Checkbox
          checked={enabled}
          onClick={(e) => {
            e.stopPropagation();
            updateState();
          }}
        />
      )}
    </Flexbox>
  );
});

export default ListItem;
