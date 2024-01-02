import { Icon, Tag } from '@lobehub/ui';
import { Divider } from 'antd';
import { Timer } from 'lucide-react';
import { memo } from 'react';

interface HistoryDividerProps {
  enable?: boolean;
  text?: string;
}

const HistoryDivider = memo<HistoryDividerProps>(({ enable, text }) => {
  if (!enable) return null;

  return (
    <div style={{ padding: '0 20px' }}>
      <Divider>
        <Tag icon={<Icon icon={Timer} />}>{text || 'History Message'}</Tag>
      </Divider>
    </div>
  );
});

export default HistoryDivider;
