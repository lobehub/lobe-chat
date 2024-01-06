import { Icon, Tag } from '@lobehub/ui';
import { Divider } from 'antd';
import { Timer } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

interface HistoryDividerProps {
  enable?: boolean;
}

const HistoryDivider = memo<HistoryDividerProps>(({ enable }) => {
  const { t } = useTranslation('common');
  if (!enable) return null;

  return (
    <div style={{ padding: '0 20px' }}>
      <Divider>
        <Tag icon={<Icon icon={Timer} />}>
          {t('historyRange', { defaultValue: 'History Message' })}
        </Tag>
      </Divider>
    </div>
  );
});

export default HistoryDivider;
