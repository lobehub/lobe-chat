import { Text } from '@lobehub/ui';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { memo } from 'react';

dayjs.extend(relativeTime);

interface TimeProps {
  updatedAt?: Date | number | string;
}

const Time = memo<TimeProps>(({ updatedAt }) => {
  if (!updatedAt) return;
  return (
    <Text
      as={'time'}
      fontSize={12}
      style={{ display: 'block', flex: 'none' }}
      title={dayjs(updatedAt).format('YYYY-MM-DD HH:mm')}
      type={'secondary'}
    >
      {dayjs(updatedAt).fromNow()}
    </Text>
  );
});

export default Time;
