import { Tooltip } from '@lobehub/ui';
import { Progress, ProgressProps } from 'antd';
import { memo } from 'react';

interface ProgressIconProps extends Omit<ProgressProps, 'percent'> {
  percent?: number | null;
}

const ProgressIcon = memo<ProgressIconProps>(({ format, percent, ...rest }) => {
  if (typeof percent !== 'number') return;
  return (
    <Tooltip title={format?.(percent)}>
      <Progress
        format={format}
        percent={percent}
        showInfo={false}
        size={[2, 12]}
        steps={5}
        {...rest}
      />
    </Tooltip>
  );
});

export default ProgressIcon;
